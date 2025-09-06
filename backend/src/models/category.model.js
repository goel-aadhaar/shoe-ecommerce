import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        parentId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const Category = mongoose.model("Category", categorySchema);
