import mongoose, { Schema } from "mongoose";

const favouriteSchema = new Schema(
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
    },
    {
        timestamps: true,
    }
);

export const Favourite = mongoose.model("Favourite", favouriteSchema);
