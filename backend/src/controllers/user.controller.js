import { User, Profile, Favourite } from "../models/model-export.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Get user profile
export const getProfile = asyncHandler(async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user.id });

    res.status(200).json(
        new ApiResponse(200, "Profile fetched successfully", profile)
    );
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
    const profile = await Profile.findOneAndUpdate(
        { userId: req.user.id },
        req.body,
        { new: true, upsert: true }
    );

    res.status(200).json(
        new ApiResponse(200, "Profile updated successfully", profile)
    );
});

// Add to favourites
export const addFavourite = asyncHandler(async (req, res) => {
    const fav = await Favourite.create({
        userId: req.user.id,
        productId: req.body.productId
    });

    res.status(201).json(
        new ApiResponse(201, "Added to favourites successfully", fav)
    );
});

// Get user favourites
export const getFavourites = asyncHandler(async (req, res) => {
    const favs = await Favourite.find({ userId: req.user.id }).populate("productId");

    res.status(200).json(
        new ApiResponse(200, "Favourites fetched successfully", favs)
    );
});

// Remove from favourites
export const removeFavourite = asyncHandler(async (req, res) => {
    await Favourite.findOneAndDelete({
        userId: req.user.id,
        productId: req.params.id
    });

    res.status(200).json(
        new ApiResponse(200, "Removed from favourites successfully", null)
    );
});
