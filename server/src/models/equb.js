import mongoose from "mongoose";

const equbSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    
    // Equb Configuration
    contributionAmount: { type: Number, required: true }, // Amount in Wei
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
    totalPool: { type: Number, default: 0 },
    memberCount: { type: Number, default: 0 },
    
    // Timestamps
    startTime: { type: Date },
    endTime: { type: Date }
}, { timestamps: true });

// Index for faster queries
equbSchema.index({ blockchainEqubId: 1 });
equbSchema.index({ creatorId: 1 });
equbSchema.index({ status: 1 });

export default mongoose.model("equb", equbSchema);