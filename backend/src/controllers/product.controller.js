import { Product, ProductImage, Review } from "../models/model-export.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// CRUD
export const createProduct = asyncHandler(async (req, res) => {
    console.log("Creating product with data:", req.body);
    
    const product = await Product.create(req.body);

    res.status(201).json(
        new ApiResponse(201, "Product created successfully", product)
    );
});

export const getProducts = asyncHandler(async (req, res) => {
    console.log("Fetching products from database...");
    
    const products = await Product.find().populate("categoryId");

    res.status(200).json(
        new ApiResponse(200, "Products fetched successfully", products)
    );
});

export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate("categoryId");

    res.status(200).json(
        new ApiResponse(200, "Product fetched successfully", product)
    );
});

export const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.status(200).json(
        new ApiResponse(200, "Product updated successfully", product)
    );
});

export const deleteProduct = asyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json(
        new ApiResponse(200, "Product deleted successfully", null)
    );
});

// Product images
export const addProductImage = asyncHandler(async (req, res) => {
    const image = await ProductImage.create(req.body);

    res.status(201).json(
        new ApiResponse(201, "Product image added successfully", image)
    );
});

// Reviews
export const addReview = asyncHandler(async (req, res) => {
    const review = await Review.create({
        userId: req.user.id,
        productId: req.body.productId,
        rating: req.body.rating,
        reviewText: req.body.reviewText,
    });

    res.status(201).json(
        new ApiResponse(201, "Review added successfully", review)
    );
});

export const getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ productId: req.params.id }).populate("userId");

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    res.status(200).json(
        new ApiResponse(
            200,
            "Product reviews fetched successfully",
            { avgRating, count: reviews.length, reviews }
        )
    );
});
