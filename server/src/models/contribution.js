import mongoose from "mongoose";

const ContributionSchema = new mongoose.Schema({
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
    amount: { 
        type: Number, 
        required: true 
    },
    round: { 
        type: Number, 
        required: true 
    },
    txHash: { 
        type: String, 
        required: true,
        unique: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'failed'], 
        default: 'pending' 
    },
    blockNumber: { 
        type: Number 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// Index for faster queries
ContributionSchema.index({ equbId: 1, round: 1 });
ContributionSchema.index({ userId: 1 });
ContributionSchema.index({ txHash: 1 });

export const Contribution = mongoose.model('Contribution', ContributionSchema);
