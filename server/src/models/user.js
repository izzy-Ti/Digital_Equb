import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyOTP: { type: String, default: '' },
    OTPExpireAt: { type: Number, default: 0 },
    IsAccVerified: { type: Boolean, default: false },
    ResetOTP: { type: String, default: '' },
    ResetOTPExpireAt: { type: Number, default: 0 },
    avater: { type: String, required: false },
    role: { type: String, required: true, enum: ['USER', 'ADMIN'], default: 'USER' }
}, { timestamps: true })

export const user = mongoose.model('user', UserSchema)