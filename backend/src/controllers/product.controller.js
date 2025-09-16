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
    
    const products = await Product.find().populate("category").populate("imageSet");

    res.status(200).json(
        new ApiResponse(200, "Products fetched successfully", products)
    );
});

export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category").populate("imageSet");

    res.status(200).json(
        new ApiResponse(200, "Product fetched successfully", product)
    );
});

export const getProductsByAttribute = asyncHandler(async (req, res) => {
    
    const { attribute, limit } = req.query;
    console.log("Request for the get Product of ", attribute);
    
    const attr = attribute || "trending";
    const max = Number(limit) || 10;


    const products = await Product.find({ attributes: attr })
        .limit(max)
        .populate("category")
        .populate({
            path: "imageSet",
            select: "thumbnail hover"
        });

    res.status(200).json(
        new ApiResponse(200, `Products with attribute '${attr}' fetched successfully`, products)
    );
});

export const getProductsByBrand = asyncHandler(async (req, res) => {
  const { brand, limit } = req.query;
  console.log("Request for the get Product of brand:", brand);

  const brandName = brand || "Puma";
  const max = Number(limit) || 10;

  if (!brandName) {
    return res.status(400).json(
      new ApiResponse(400, "Brand query parameter is required")
    );
  }

  const products = await Product.find({ brand: brandName })
    .limit(max)
    .populate("category")
    .populate({
      path: "imageSet",
      select: "thumbnail hover"
    });

  res.status(200).json(
    new ApiResponse(200, `Products with brand '${brandName}' fetched successfully`, products)
  );
});


export const getRelatedShoes = asyncHandler(async (req,res) => {
  const {gender, category, price} = req.query;
  console.log("request for related shoes");

  const genderValue = gender || "Male";
  const pValue = price || 10000;
  const categoryName = category || "shoes";


  const product = await Product.find({for : genderValue, price: { $gte: pValue-1000, $lte: pValue+1000 }})
      .limit(6)
      .populate({
        path: "category",
        match: { name: categoryName }, 
      })
      .populate("imageSet", "thumbnail hover"); 
  
  res.status(200).json(
    new ApiResponse(200, "Shoes fetched successfully", product)
  );
      
})

export const getProductsByGender = asyncHandler(async (req, res) => {
  const { gender, limit } = req.query;
  console.log("Request for the get Product of gender:", gender);

  const genderValue = gender || "Male"; 
  const max = Number(limit) || 10;

  const products = await Product.find({ for: genderValue })
    .limit(max)
    .populate("category")
    .populate({
      path: "imageSet",
      select: "thumbnail hover"
    });

  res.status(200).json(
    new ApiResponse(200, `Products for gender '${genderValue}' fetched successfully`, products)
  );
});


export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category, limit } = req.query;
  console.log("Request for the get Product of category:", category);

  const categoryName = category || "shoes";
  const max = Number(limit) || 10;

  if (!categoryName) {
    return res.status(400).json(
      new ApiResponse(400, "Category query parameter is required")
    );
  }

  const products = await Product.find()
    .limit(max)
    .populate({
      path : "category",
      match : {name : categoryName}
    })
    .populate({
      path: "imageSet",
      select: "thumbnail hover"
    });

  res.status(200).json(
    new ApiResponse(200, `Products in category '${categoryName}' fetched successfully`, products)
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
