import mongoose, { Schema } from "mongoose";

const orderStatusHistorySchema = new Schema(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
            required: true,
        },
        changedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
    }
);

export const OrderStatusHistory = mongoose.model("OrderStatusHistory", orderStatusHistorySchema);
