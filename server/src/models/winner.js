import mongoose from "mongoose";
import { ethers } from "ethers";

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
        type: String, 
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

// Amount Normalization Middleware
WinnerSchema.pre('save', function(next) {
    if (this.isModified('payoutAmount') && this.payoutAmount) {
        const val = this.payoutAmount.toString();
        if (val.includes('.')) {
            try {
                this.payoutAmount = ethers.parseEther(val).toString();
            } catch (e) {
                console.error("Normalization error [payoutAmount]:", e);
            }
        }
    }
    next();
});

export const Winner = mongoose.model('Winner', WinnerSchema);
