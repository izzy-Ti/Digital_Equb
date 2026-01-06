import mongoose from "mongoose";
import { ethers } from "ethers";

const equbSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    
    // Equb Configuration
    contributionAmount: { type: String, required: true }, // Amount in Wei (String to handle BigInt)
    cycleDuration: { type: Number, required: true }, // Duration in seconds
    maxMembers: { type: Number, required: true },
    
    // Blockchain Integration
    blockchainEqubId: { type: Number, required: true, unique: true }, // Maps to smart contract equb ID
    contractAddress: { type: String, default: '' },
    
    // Status
    status: { 
        type: String, 
        enum: ['pending', 'active', 'paused', 'ended'], 
        default: 'pending' 
    },
    
    // Creator
    creatorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user", 
        required: true 
    },
    creatorWallet: { type: String, required: true },
    
    // Current State
    currentRound: { type: Number, default: 0 },
    totalPool: { type: String, default: '0' },
    memberCount: { type: Number, default: 0 },
    
    // Timestamps
    startTime: { type: Date },
    endTime: { type: Date }
}, { timestamps: true });

// Index for faster queries
equbSchema.index({ blockchainEqubId: 1 });
equbSchema.index({ creatorId: 1 });
equbSchema.index({ status: 1 });

// Amount Normalization Middleware
equbSchema.pre('save', function(next) {
    if (this.isModified('contributionAmount') && this.contributionAmount) {
        const val = this.contributionAmount.toString();
        if (val.includes('.')) {
            try {
                this.contributionAmount = ethers.parseEther(val).toString();
            } catch (e) {
                console.error("Normalization error [contributionAmount]:", e);
            }
        }
    }
    if (this.isModified('totalPool') && this.totalPool) {
        const val = this.totalPool.toString();
        if (val.includes('.')) {
            try {
                this.totalPool = ethers.parseEther(val).toString();
            } catch (e) {
                console.error("Normalization error [totalPool]:", e);
            }
        }
    }
    next();
});

export default mongoose.model("equb", equbSchema);