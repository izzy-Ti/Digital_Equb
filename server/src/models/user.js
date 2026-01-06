import mongoose from "mongoose";
import { ethers } from "ethers";


const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Wallet Integration (Critical for Web3)
    walletAddress: { type: String, default: '', sparse: true },
    isWalletLinked: { type: Boolean, default: false },
    
    // Profile Information
    phoneNumber: { type: String, default: '' },
    avatar: { type: String, default: '' },
    
    // Email Verification
    verifyOTP: { type: String, default: '' },
    OTPExpireAt: { type: Number, default: 0 },
    IsAccVerified: { type: Boolean, default: false },
    
    // Password Reset
    ResetOTP: { type: String, default: '' },
    ResetOTPExpireAt: { type: Number, default: 0 },
    
    // Equb Activity Tracking
    activeEqubCount: { type: Number, default: 0, min: 0, max: 3 }, // Max 3 active equbs per user
    totalWinnings: { type: String, default: '0' }, // Total amount won across all equbs (Wei as String)
    
    // User Role
    role: { type: String, required: true, enum: ['USER', 'ADMIN'], default: 'USER' }
}, { timestamps: true })
// Amount Normalization Middleware
UserSchema.pre('save', function(next) {
    if (this.isModified('totalWinnings') && this.totalWinnings) {
        const val = this.totalWinnings.toString();
        if (val.includes('.')) {
            try {
                this.totalWinnings = ethers.parseEther(val).toString();
            } catch (e) {
                console.error("Normalization error [totalWinnings]:", e);
            }
        }
    }
    next();
});

export const user = mongoose.model('user', UserSchema)