import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        reviewText: { type: String },
    },
    {
        timestamps: true,
    }
);
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
