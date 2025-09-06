import { Product, ProductImage, Review } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";

// CRUD
export const createProduct = asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, message: "Product created", data: product });
});

export const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find().populate("categoryId");
    res.json({ success: true, data: products });
});

export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate("categoryId");
    res.json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: "Product updated", data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted" });
});

// Product images
export const addProductImage = asyncHandler(async (req, res) => {
    const image = await ProductImage.create(req.body);
    res.status(201).json({ success: true, data: image });
});

// Reviews
export const addReview = asyncHandler(async (req, res) => {
    const review = await Review.create({
        userId: req.user.id,
        productId: req.body.productId,
        rating: req.body.rating,
        reviewText: req.body.reviewText,
    });
    res.status(201).json({ success: true, message: "Review added", data: review });
});

export const getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ productId: req.params.id }).populate("userId");
    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;
    res.json({ success: true, avgRating, count: reviews.length, reviews });
});
