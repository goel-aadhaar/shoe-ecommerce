import { User, Profile, Favourite } from "../models/model-export.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Fetch profile
export const getProfile = asyncHandler(async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user.id });
    res.json({ success: true, data: profile });
});

// Update profile
export const updateProfile = asyncHandler(async (req, res) => {
    const profile = await Profile.findOneAndUpdate(
        { userId: req.user.id },
        req.body,
        { new: true, upsert: true }
    );
    res.json({ success: true, message: "Profile updated", data: profile });
});

// Favourites
export const addFavourite = asyncHandler(async (req, res) => {
    const fav = await Favourite.create({ userId: req.user.id, productId: req.body.productId });
    res.status(201).json({ success: true, message: "Added to favourites", data: fav });
});

export const getFavourites = asyncHandler(async (req, res) => {
    const favs = await Favourite.find({ userId: req.user.id }).populate("productId");
    res.json({ success: true, data: favs });
});

export const removeFavourite = asyncHandler(async (req, res) => {
    await Favourite.findOneAndDelete({ userId: req.user.id, productId: req.params.id });
    res.json({ success: true, message: "Removed from favourites" });
});
