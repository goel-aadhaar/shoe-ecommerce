import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema(
    {
        cartId: {
            type: Schema.Types.ObjectId,
            ref: "Cart",
            required: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
        selectedColor: { type: String },
        selectedSize: { type: String },
    },
    {
        timestamps: true,
    }
);

export const CartItem = mongoose.model("CartItem", cartItemSchema);
