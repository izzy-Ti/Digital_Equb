import mongoose from "mongoose";

const EqubMemberSchema = new mongoose.Schema({
    equbId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "equb", 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user", 
        required: true 
    },
    walletAddress: { 
        type: String, 
        required: true 
    },
    joinOrder: { 
        type: Number, 
        required: true 
    },
    hasWon: { 
        type: Boolean, 
        default: false 
    },
    joinedAt: { 
        type: Date, 
        default: Date.now 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

// Compound index to ensure a user can only join an equb once
EqubMemberSchema.index({ equbId: 1, userId: 1 }, { unique: true });

export const EqubMember = mongoose.model('EqubMember', EqubMemberSchema);
