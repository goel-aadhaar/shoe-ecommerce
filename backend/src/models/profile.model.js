import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        fullname: { type: String },
        phone: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pincode: { type: String },
        profileImage: { type: String },
    },
    {
        timestamps: true,
    }
);

export const Profile = mongoose.model("Profile", profileSchema);
