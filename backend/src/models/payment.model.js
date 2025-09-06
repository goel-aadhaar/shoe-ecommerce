import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            required: true,
        }, // e.g. "stripe"
        paymentStatus: {
            type: String,
            enum: ["pending", "success", "failed"],
            default: "pending",
        },
        transactionId: { type: String },
    },
    {
        timestamps: true,
    }
);

export const Payment = mongoose.model("Payment", paymentSchema);
