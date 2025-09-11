import mongoose, { Schema } from "mongoose";

const productImageSchema = new Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
        },
        thumbnail: {
            type: String,
            required: true,
            default: "https://placehold.co/400", // fallback URL
        },
        hover: {
            type: String,
            required: true,
            default: "https://placehold.co/400",
        },
        sides: [
            {
                type: String,
                default: "https://placehold.co/400",
            }
        ],
    },
    {
        timestamps: true,
    }
);

export const ProductImage = mongoose.model("ProductImage", productImageSchema);
