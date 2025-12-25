import { Contribution } from "../models/contribution.js";
import Equb from "../models/equb.js";
import { EqubMember } from "../models/equbMember.js";
import { user } from "../models/user.js";

// Record a contribution after blockchain transaction
export const recordContribution = async (req, res) => {
    const { userId, equbId, amount, round, txHash, blockNumber } = req.body;

    if (!userId || !equbId || !amount || !round || !txHash) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        // Check if transaction already recorded
        const existingContribution = await Contribution.findOne({ txHash });
        if (existingContribution) {
            return res.json({ success: false, message: 'Contribution already recorded' });
        }

        // Verify user is member
        const member = await EqubMember.findOne({ equbId, userId, isActive: true });
        if (!member) {
            return res.json({ success: false, message: 'Not a member of this equb' });
        }

        // Create contribution record
        const contribution = new Contribution({
            equbId,
            userId,
            amount,
            round,
            txHash,
            blockNumber,
            status: 'pending'
        });

        await contribution.save();

        return res.json({ 
            success: true, 
            message: 'Contribution recorded',
            contribution
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Update contribution status (called by blockchain listener)
export const updateContributionStatus = async (req, res) => {
    const { txHash, status, blockNumber } = req.body;

    if (!txHash || !status) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const contribution = await Contribution.findOne({ txHash });
        if (!contribution) {
            return res.json({ success: false, message: 'Contribution not found' });
        }

        contribution.status = status;
        if (blockNumber) contribution.blockNumber = blockNumber;
        await contribution.save();

        // If confirmed, update equb total pool
        if (status === 'confirmed') {
            const equb = await Equb.findById(contribution.equbId);
            if (equb) {
                equb.totalPool += contribution.amount;
                await equb.save();
            }
        }

        return res.json({ success: true, message: 'Status updated', contribution });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get user's contribution history
export const getUserContributions = async (req, res) => {
    const { userId } = req.params;

    try {
        const contributions = await Contribution.find({ userId })
            .populate('equbId', 'name contributionAmount')
            .sort({ createdAt: -1 });

        const totalContributed = contributions
            .filter(c => c.status === 'confirmed')
            .reduce((sum, c) => sum + c.amount, 0);

        return res.json({ 
            success: true, 
            contributions,
            totalContributed
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get equb's contribution history
export const getEqubContributions = async (req, res) => {
    const { equbId } = req.params;
    const { round } = req.query;

    try {
        const query = { equbId };
        if (round) query.round = parseInt(round);

        const contributions = await Contribution.find(query)
            .populate('userId', 'name email avatar')
            .sort({ createdAt: -1 });

        const totalCollected = contributions
            .filter(c => c.status === 'confirmed')
            .reduce((sum, c) => sum + c.amount, 0);

        return res.json({ 
            success: true, 
            contributions,
            totalCollected
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get contribution status by transaction hash
export const getContributionByTxHash = async (req, res) => {
    const { txHash } = req.params;

    try {
        const contribution = await Contribution.findOne({ txHash })
            .populate('userId', 'name email')
            .populate('equbId', 'name');

        if (!contribution) {
            return res.json({ success: false, message: 'Contribution not found' });
        }

        return res.json({ success: true, contribution });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get round statistics
export const getRoundStats = async (req, res) => {
    const { equbId, round } = req.params;

    try {
        const equb = await Equb.findById(equbId);
        if (!equb) {
            return res.json({ success: false, message: 'Equb not found' });
        }

        const contributions = await Contribution.find({ 
            equbId, 
            round: parseInt(round),
            status: 'confirmed'
        });

        const totalMembers = await EqubMember.countDocuments({ equbId, isActive: true });
        const contributedMembers = contributions.length;
        const totalCollected = contributions.reduce((sum, c) => sum + c.amount, 0);

        return res.json({
            success: true,
            stats: {
                round: parseInt(round),
                totalMembers,
                contributedMembers,
                pendingMembers: totalMembers - contributedMembers,
                totalCollected,
                expectedTotal: equb.contributionAmount * totalMembers
            }
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
