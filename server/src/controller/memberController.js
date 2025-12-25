import { EqubMember } from "../models/equbMember.js";
import Equb from "../models/equb.js";
import { user } from "../models/user.js";

// Join an equb
export const joinEqub = async (req, res) => {
    const { userId, equbId, walletAddress } = req.body;

    if (!userId || !equbId || !walletAddress) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        // Check if user exists and wallet matches
        const User = await user.findById(userId);
        if (!User) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (User.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.json({ success: false, message: 'Wallet address mismatch' });
        }

        // Check if equb exists
        const equb = await Equb.findById(equbId);
        if (!equb) {
            return res.json({ success: false, message: 'Equb not found' });
        }

        // Check if equb is active
        if (equb.status !== 'active') {
            return res.json({ success: false, message: 'Equb is not active' });
        }

        // Check if equb is full
        if (equb.memberCount >= equb.maxMembers) {
            return res.json({ success: false, message: 'Equb is full' });
        }

        // Check if user already joined
        const existingMember = await EqubMember.findOne({ equbId, userId });
        if (existingMember) {
            return res.json({ success: false, message: 'Already a member' });
        }

        // Check user's active equb count
        if (User.activeEqubCount >= 3) {
            return res.json({ success: false, message: 'Maximum active equbs reached (3)' });
        }

        // Get join order (next available position)
        const memberCount = await EqubMember.countDocuments({ equbId });
        const joinOrder = memberCount + 1;

        // Create new member
        const newMember = new EqubMember({
            equbId,
            userId,
            walletAddress: walletAddress.toLowerCase(),
            joinOrder
        });

        await newMember.save();

        // Update equb member count
        equb.memberCount += 1;
        await equb.save();

        // Update user's active equb count
        User.activeEqubCount += 1;
        await User.save();

        return res.json({ 
            success: true, 
            message: 'Joined equb successfully',
            joinOrder,
            member: newMember
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Leave an equb (only if hasn't won yet)
export const leaveEqub = async (req, res) => {
    const { userId, equbId } = req.body;

    if (!userId || !equbId) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const member = await EqubMember.findOne({ equbId, userId });
        if (!member) {
            return res.json({ success: false, message: 'Not a member of this equb' });
        }

        // Check if user has already won
        if (member.hasWon) {
            return res.json({ success: false, message: 'Cannot leave after winning' });
        }

        // Mark as inactive instead of deleting
        member.isActive = false;
        await member.save();

        // Update equb member count
        const equb = await Equb.findById(equbId);
        if (equb) {
            equb.memberCount -= 1;
            await equb.save();
        }

        // Update user's active equb count
        const User = await user.findById(userId);
        if (User && User.activeEqubCount > 0) {
            User.activeEqubCount -= 1;
            await User.save();
        }

        return res.json({ success: true, message: 'Left equb successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get all members of an equb
export const getEqubMembers = async (req, res) => {
    const { equbId } = req.params;

    try {
        const members = await EqubMember.find({ equbId, isActive: true })
            .populate('userId', 'name email avatar walletAddress')
            .sort({ joinOrder: 1 });

        return res.json({ success: true, members });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get user's equb memberships
export const getUserEqubs = async (req, res) => {
    const { userId } = req.params;

    try {
        const memberships = await EqubMember.find({ userId, isActive: true })
            .populate('equbId')
            .sort({ createdAt: -1 });

        return res.json({ success: true, memberships });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Check if user is member of equb
export const checkMembership = async (req, res) => {
    const { userId, equbId } = req.params;

    try {
        const member = await EqubMember.findOne({ equbId, userId, isActive: true });
        
        return res.json({ 
            success: true, 
            isMember: !!member,
            memberInfo: member || null
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
