import { Category } from "../models/model-export.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
    const category = await Category.create(req.body);
    res.status(201)
    .json(
        new ApiResponse(
            200,
            "Category created",
            category
        )
    )
});

export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    res.status(201)
    .json(
        new ApiResponse(
            200,
            "Categories fetched successfully",
            categories
        )
    )
});
