import mongoose from "mongoose";

const WinnerSchema = new mongoose.Schema({
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
    round: { 
        type: Number, 
        required: true 
    },
    payoutAmount: { 
        type: Number, 
        required: true 
    },
    payoutTxHash: { 
        type: String, 
        required: true 
    },
    payoutStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' 
    },
    selectedAt: { 
        type: Date, 
        default: Date.now 
    },
    blockNumber: { 
        type: Number 
    }
}, { timestamps: true });

// Index for faster queries
WinnerSchema.index({ equbId: 1, round: 1 });
WinnerSchema.index({ userId: 1 });

export const Winner = mongoose.model('Winner', WinnerSchema);
