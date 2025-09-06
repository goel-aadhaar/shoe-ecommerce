import { Category } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, message: "Category created", data: category });
});

export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    res.json({ success: true, data: categories });
});
