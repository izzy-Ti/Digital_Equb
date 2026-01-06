import Equb from "../models/equb.js";
import { user } from "../models/user.js";
import { EqubMember } from "../models/equbMember.js";
import { Contribution } from "../models/contribution.js";
import { Winner } from "../models/winner.js";

export const createEqub = async (req, res) => {
    const { 
        userId, 
        name, 
        description,
        contributionAmount, 
        cycleDuration, 
        maxMembers,
        blockchainEqubId,
        contractAddress,
        creatorWallet
    } = req.body;

    if (!userId || !name || !contributionAmount || !cycleDuration || !maxMembers || !blockchainEqubId || !creatorWallet) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const User = await user.findById(userId);
        if (!User) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (User.walletAddress && User.walletAddress.toLowerCase() !== creatorWallet.toLowerCase()) {
            console.log(`Mismatch: DB(${User.walletAddress}) vs Req(${creatorWallet})`);
            return res.json({ success: false, message: `Wallet address mismatch. Expected: ${User.walletAddress}, Got: ${creatorWallet}` });
        }
        if (!User.walletAddress) {
             return res.json({ success: false, message: 'No wallet linked to this account. Please link your wallet first.' });
        }
        const existingEqub = await Equb.findOne({ blockchainEqubId });
        if (existingEqub) {
            return res.json({ success: false, message: 'Equb already exists with this blockchain ID' });
        }
        const newEqub = new Equb({
            name,
            description: description || '',
            contributionAmount,
            cycleDuration,
            maxMembers,
            blockchainEqubId,
            contractAddress: contractAddress || '',
            creatorId: userId,
            creatorWallet: creatorWallet.toLowerCase(),
            status: 'pending'
        });

        await newEqub.save();

        return res.json({ 
            success: true, 
            message: 'Equb created successfully',
            equb: newEqub
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
export const startEqub = async (req, res) => {
    const { equbId, userId } = req.body;

    if (!equbId || !userId) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const equb = await Equb.findById(equbId);
        if (!equb) {
            return res.json({ success: false, message: 'Equb not found' });
        }

        // Verify user is creator
        if (equb.creatorId.toString() !== userId) {
            return res.json({ success: false, message: 'Only creator can start equb' });
        }

        if (equb.status === 'active') {
            return res.json({ success: false, message: 'Equb already active' });
        }

        equb.status = 'active';
        equb.startTime = new Date();
        await equb.save();

        return res.json({ 
            success: true, 
            message: 'Equb started successfully',
            equb
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
export const pauseEqub = async (req, res) => {
    const { equbId, userId } = req.body;

    if (!equbId || !userId) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const equb = await Equb.findById(equbId);
        if (!equb) {
            return res.json({ success: false, message: 'Equb not found' });
        }

        if (equb.creatorId.toString() !== userId) {
            return res.json({ success: false, message: 'Only creator can pause equb' });
        }

        equb.status = 'paused';
        await equb.save();

        return res.json({ 
            success: true, 
            message: 'Equb paused successfully',
            equb
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
export const endEqub = async (req, res) => {
    const { equbId, userId } = req.body;

    if (!equbId || !userId) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const equb = await Equb.findById(equbId);
        if (!equb) {
            return res.json({ success: false, message: 'Equb not found' });
        }

        if (equb.creatorId.toString() !== userId) {
            return res.json({ success: false, message: 'Only creator can end equb' });
        }

        equb.status = 'ended';
        equb.endTime = new Date();
        await equb.save();

        // Update all active members' activeEqubCount
        const members = await EqubMember.find({ equbId, isActive: true });
        for (const member of members) {
            const User = await user.findById(member.userId);
            if (User && User.activeEqubCount > 0) {
                User.activeEqubCount -= 1;
                await User.save();
            }
            member.isActive = false;
            await member.save();
        }

        return res.json({ 
            success: true, 
            message: 'Equb ended successfully',
            equb
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
export const getEqubs = async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    try {
        const query = {};
        if (status) query.status = status;

        const equbs = await Equb.find(query)
            .populate('creatorId', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Equb.countDocuments(query);

        return res.json({
            success: true,
            equbs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
export const getEqubById = async (req, res) => {
    const { equbId } = req.params;

    try {
        const equb = await Equb.findById(equbId)
            .populate('creatorId', 'name email avatar walletAddress');

        if (!equb) {
            return res.json({ success: false, message: 'Equb not found' });
        }

        // Get member count
        const memberCount = await EqubMember.countDocuments({ equbId, isActive: true });

        // Get current round contributions
        const currentRoundContributions = await Contribution.countDocuments({
            equbId,
            round: equb.currentRound,
            status: 'confirmed'
        });

        // Get latest winner
        const latestWinner = await Winner.findOne({ equbId })
            .populate('userId', 'name avatar')
            .sort({ round: -1 });

        return res.json({
            success: true,
            equb: {
                ...equb.toObject(),
                memberCount,
                currentRoundContributions,
                latestWinner
            }
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
export const getEqubsByCreator = async (req, res) => {
    const { userId } = req.params;

    try {
        const equbs = await Equb.find({ creatorId: userId })
            .sort({ createdAt: -1 });

        return res.json({ success: true, equbs });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
export const syncEqubFromBlockchain = async (req, res) => {
    const { equbId, currentRound, totalPool, isActive } = req.body;

    if (!equbId) {
        return res.json({ success: false, message: 'Missing equb ID' });
    }

    try {
        const equb = await Equb.findById(equbId);
        if (!equb) {
            return res.json({ success: false, message: 'Equb not found' });
        }

        if (currentRound !== undefined) equb.currentRound = currentRound;
        if (totalPool !== undefined) equb.totalPool = totalPool;
        if (isActive !== undefined) {
            equb.status = isActive ? 'active' : 'paused';
        }

        await equb.save();

        return res.json({ 
            success: true, 
            message: 'Equb synced successfully',
            equb
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
export const getEqubStats = async (req, res) => {
    const { equbId } = req.params;

    try {
        const equb = await Equb.findById(equbId);
        if (!equb) {
            return res.json({ success: false, message: 'Equb not found' });
        }

        const totalMembers = await EqubMember.countDocuments({ equbId, isActive: true });
        const contributions = await Contribution.find({ equbId, status: 'confirmed' });
        const totalCollected = contributions.reduce((sum, c) => (BigInt(sum) + BigInt(c.amount)).toString(), '0');
        const totalWinners = await Winner.countDocuments({ equbId });

        return res.json({
            success: true,
            stats: {
                totalMembers,
                totalContributions: contributions.length,
                totalCollected,
                totalWinners,
                currentRound: equb.currentRound,
                status: equb.status
            }
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};