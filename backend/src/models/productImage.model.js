import mongoose, { Schema } from "mongoose";

const productImageSchema = new Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        type: {
            type: String,
            enum: ["thumbnail", "hover", "side"],
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const ProductImage = mongoose.model("ProductImage", productImageSchema);
