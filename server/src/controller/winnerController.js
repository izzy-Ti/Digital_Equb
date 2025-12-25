import { Winner } from "../models/winner.js";
import Equb from "../models/equb.js";
import { EqubMember } from "../models/equbMember.js";
import { user } from "../models/user.js";

// Record winner after blockchain selection
export const recordWinner = async (req, res) => {
    const { equbId, userId, walletAddress, round, payoutAmount, payoutTxHash, blockNumber } = req.body;

    if (!equbId || !userId || !walletAddress || !round || !payoutAmount || !payoutTxHash) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        // Check if winner already recorded for this round
        const existingWinner = await Winner.findOne({ equbId, round });
        if (existingWinner) {
            return res.json({ success: false, message: 'Winner already recorded for this round' });
        }

        // Verify member exists
        const member = await EqubMember.findOne({ equbId, userId, isActive: true });
        if (!member) {
            return res.json({ success: false, message: 'Not a member of this equb' });
        }

        // Create winner record
        const winner = new Winner({
            equbId,
            userId,
            walletAddress: walletAddress.toLowerCase(),
            round,
            payoutAmount,
            payoutTxHash,
            blockNumber,
            payoutStatus: 'pending'
        });

        await winner.save();

        // Mark member as winner
        member.hasWon = true;
        await member.save();

        return res.json({ 
            success: true, 
            message: 'Winner recorded',
            winner
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Update winner payout status
export const updateWinnerStatus = async (req, res) => {
    const { payoutTxHash, status, blockNumber } = req.body;

    if (!payoutTxHash || !status) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const winner = await Winner.findOne({ payoutTxHash });
        if (!winner) {
            return res.json({ success: false, message: 'Winner record not found' });
        }

        winner.payoutStatus = status;
        if (blockNumber) winner.blockNumber = blockNumber;
        await winner.save();

        // If payout completed, update user's total winnings
        if (status === 'completed') {
            const User = await user.findById(winner.userId);
            if (User) {
                User.totalWinnings += winner.payoutAmount;
                await User.save();
            }

            // Update equb current round
            const equb = await Equb.findById(winner.equbId);
            if (equb) {
                equb.currentRound = winner.round;
                equb.totalPool = 0; // Reset pool after payout
                await equb.save();
            }
        }

        return res.json({ success: true, message: 'Winner status updated', winner });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get winners for an equb
export const getEqubWinners = async (req, res) => {
    const { equbId } = req.params;

    try {
        const winners = await Winner.find({ equbId })
            .populate('userId', 'name email avatar walletAddress')
            .sort({ round: 1 });

        return res.json({ success: true, winners });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get current/latest winner
export const getCurrentWinner = async (req, res) => {
    const { equbId } = req.params;

    try {
        const winner = await Winner.findOne({ equbId })
            .populate('userId', 'name email avatar walletAddress')
            .sort({ round: -1 });

        if (!winner) {
            return res.json({ success: false, message: 'No winners yet' });
        }

        return res.json({ success: true, winner });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get user's winning history
export const getUserWinnings = async (req, res) => {
    const { userId } = req.params;

    try {
        const winnings = await Winner.find({ userId, payoutStatus: 'completed' })
            .populate('equbId', 'name contributionAmount')
            .sort({ selectedAt: -1 });

        const totalWon = winnings.reduce((sum, w) => sum + w.payoutAmount, 0);

        return res.json({ 
            success: true, 
            winnings,
            totalWon,
            winCount: winnings.length
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get winner by round
export const getWinnerByRound = async (req, res) => {
    const { equbId, round } = req.params;

    try {
        const winner = await Winner.findOne({ equbId, round: parseInt(round) })
            .populate('userId', 'name email avatar walletAddress');

        if (!winner) {
            return res.json({ success: false, message: 'No winner for this round' });
        }

        return res.json({ success: true, winner });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get eligible members for next winner selection
export const getEligibleMembers = async (req, res) => {
    const { equbId } = req.params;

    try {
        // Get all active members who haven't won yet
        const eligibleMembers = await EqubMember.find({ 
            equbId, 
            isActive: true,
            hasWon: false
        })
        .populate('userId', 'name email avatar walletAddress')
        .sort({ joinOrder: 1 });

        return res.json({ 
            success: true, 
            eligibleMembers,
            count: eligibleMembers.length
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
