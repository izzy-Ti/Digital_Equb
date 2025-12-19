import mongoose from "mongoose";

const equbSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    duration: { type: Number, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    payments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
            amount: { type: Number, required: true },
            paidAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true })

export default mongoose.model("equb", equbSchema)