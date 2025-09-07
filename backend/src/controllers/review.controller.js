import { Review } from "../models/model-export.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ userId: req.user.id }).populate("productId");
    res.json({ success: true, data: reviews });
});
