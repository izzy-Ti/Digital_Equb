import Equb from "../models/equb.js";
import { user } from "../models/user.js";
import { EqubMember } from "../models/equbMember.js";
import { Contribution } from "../models/contribution.js";
import { Winner } from "../models/winner.js";

// Get system-wide statistics
export const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await user.countDocuments();
        const totalEqubs = await Equb.countDocuments();
        const activeEqubs = await Equb.countDocuments({ status: 'active' });
        const totalContributions = await Contribution.countDocuments({ status: 'confirmed' });
        
        const totalVolume = await Contribution.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalPayouts = await Winner.aggregate([
            { $match: { payoutStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$payoutAmount' } } }
        ]);

        return res.json({
            success: true,
            stats: {
                totalUsers,
                totalEqubs,
                activeEqubs,
                totalContributions,
                totalVolume: totalVolume[0]?.total || 0,
                totalPayouts: totalPayouts[0]?.total || 0
            }
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get all equbs with detailed info (admin view)
export const getAllEqubsAdmin = async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;

    try {
        const query = {};
        if (status) query.status = status;

        const equbs = await Equb.find(query)
            .populate('creatorId', 'name email walletAddress')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Equb.countDocuments(query);

        // Add member count for each equb
        const equbsWithDetails = await Promise.all(
            equbs.map(async (equb) => {
                const memberCount = await EqubMember.countDocuments({ 
                    equbId: equb._id, 
                    isActive: true 
                });
                return {
                    ...equb.toObject(),
                    memberCount
                };
            })
        );

        return res.json({
            success: true,
            equbs: equbsWithDetails,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get all users (admin view)
export const getAllUsers = async (req, res) => {
    const { page = 1, limit = 20, role } = req.query;

    try {
        const query = {};
        if (role) query.role = role;

        const users = await user.find(query)
            .select('-password -verifyOTP -ResetOTP')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await user.countDocuments(query);

        return res.json({
            success: true,
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Flag equb for review
export const flagEqub = async (req, res) => {
    const { equbId, reason } = req.body;

    if (!equbId || !reason) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const equb = await Equb.findById(equbId);
        if (!equb) {
            return res.json({ success: false, message: 'Equb not found' });
        }

        // You can add a flagged field to the equb model or create a separate flags collection
        // For now, we'll just pause it
        equb.status = 'paused';
        await equb.save();

        return res.json({ 
            success: true, 
            message: 'Equb flagged and paused',
            equb
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get recent activity
export const getRecentActivity = async (req, res) => {
    const { limit = 50 } = req.query;

    try {
        // Get recent contributions
        const recentContributions = await Contribution.find({ status: 'confirmed' })
            .populate('userId', 'name email')
            .populate('equbId', 'name')
            .sort({ createdAt: -1 })
            .limit(limit);

        // Get recent winners
        const recentWinners = await Winner.find({ payoutStatus: 'completed' })
            .populate('userId', 'name email')
            .populate('equbId', 'name')
            .sort({ createdAt: -1 })
            .limit(limit);

        return res.json({
            success: true,
            recentContributions,
            recentWinners
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get user details (admin view)
export const getUserDetails = async (req, res) => {
    const { userId } = req.params;

    try {
        const User = await user.findById(userId).select('-password -verifyOTP -ResetOTP');
        if (!User) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Get user's equbs
        const memberships = await EqubMember.find({ userId, isActive: true })
            .populate('equbId');

        // Get user's contributions
        const contributions = await Contribution.find({ userId, status: 'confirmed' });
        const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0);

        // Get user's winnings
        const winnings = await Winner.find({ userId, payoutStatus: 'completed' });
        const totalWon = winnings.reduce((sum, w) => sum + w.payoutAmount, 0);

        return res.json({
            success: true,
            user: User,
            stats: {
                totalEqubs: memberships.length,
                totalContributions: contributions.length,
                totalContributed,
                totalWinnings: winnings.length,
                totalWon
            },
            memberships,
            recentContributions: contributions.slice(0, 10),
            recentWinnings: winnings.slice(0, 10)
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Update user role
export const updateUserRole = async (req, res) => {
    const { userId, role } = req.body;

    if (!userId || !role) {
        return res.json({ success: false, message: 'Missing details' });
    }

    if (!['USER', 'ADMIN'].includes(role)) {
        return res.json({ success: false, message: 'Invalid role' });
    }

    try {
        const User = await user.findById(userId);
        if (!User) {
            return res.json({ success: false, message: 'User not found' });
        }

        User.role = role;
        await User.save();

        return res.json({ 
            success: true, 
            message: 'User role updated',
            user: User
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
