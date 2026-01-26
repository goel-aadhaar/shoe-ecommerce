import { Product, ProductImage, Review, Category } from "../models/model-export.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAndStoreEmbedding } from "../services/embedding.service.js";
import { ProductDescription } from "../models/productDescription.model.js";
// CRUD
export const createProduct = asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);

    if (req.body.description) {
        console.log("Triggering background embedding generation...");
        generateAndStoreEmbedding(product._id, req.body.description).catch(err => {
            console.error("Background embedding failed:", err);
        });
    }

    res.status(201).json(
        new ApiResponse(201, "Product created successfully", product)
    );
});



export const getSimilarShoes = asyncHandler(async (req, res) => {
    try{
      const { shoe_id } = req.params;
      const sourceDoc = await ProductDescription.findOne({ shoe_id: shoe_id });
      console.log("shoe_id :: ", shoe_id);
      
      if (!sourceDoc) {
        return res.status(404).json({ message: "Embedding not found for this product" });
      }

      // console.log("embedding :: ", sourceDoc);
      
      // STEP 2: Run Aggregation Pipeline on 'ProductDescription'
    const recommendations = await ProductDescription.aggregate([
      {
        // A. Find similar IDs based on vector
        "$vectorSearch": {
          "index": "vector_index",       // Ensure this index exists on 'productDescriptions' collection
          "path": "embedding_description",
          "queryVector": sourceDoc.embedding_description,
          "numCandidates": 50,
          "limit": 6
        }
      },
      {
        // B. Exclude the current shoe itself
        // Assuming 'id' in this collection matches the 'shoe_id'
        "$match": { 
          "shoe_id": { "$ne": sourceDoc.shoe_id } 
        } 
      },
      {
        // C. Limit to top 5 before doing the heavy lookup
        "$limit": 5 
      },
      {
        // D. JOIN with the main 'products' collection
        "$lookup": {
          "from": "products",       // The ACTUAL name of your main collection in MongoDB (usually lowercase plural)
          "localField": "shoe_id",       // The field in 'productDescriptions' that links to the product
          "foreignField": "_id",    // The field in 'products' to match against
          "as": "fullProductInfo"   // The name of the array where data will land
        }
      },
      {
        // E. Unwrap the array created by $lookup
        "$unwind": "$fullProductInfo"
      },
      {
        // F. Format the final output
        "$project": {
          "_id": "$fullProductInfo._id",
          "name": "$fullProductInfo.name",
          "brand": "$fullProductInfo.brand",
          "for": "$fullProductInfo.for",
          "color": "$fullProductInfo.color",
          "category": "$fullProductInfo.category",
          "rating": "$fullProductInfo.rating",
          "price": "$fullProductInfo.price",
          "image": "$fullProductInfo.image",
          "matchScore": { "$meta": "vectorSearchScore" } // Optional: see how good the match was
        }
      }
    ]);
    console.log("recommendation : ", recommendations);
    
    res.json(recommendations);
    console.log("similar shoes given:  ");
    
    }catch(err){
        console.error("Error fetching similar shoes:", err);
        return res.status(500).json(new ApiResponse(500, "Internal server error", null));
    }
});


export const getProductDescriptions = asyncHandler(async (req, res) => {
    console.log("Fetching product descriptions from database...");
    const descriptions = await ProductDescription.find();

    res.status(200).json(
        new ApiResponse(200, "Product descriptions fetched successfully", descriptions)
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
    console.log("Request for the get Product of attribute ", attribute);
    
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

export const getRelatedShoes = asyncHandler(async (req, res) => {
  const { gender, category, price } = req.query;

  const genderValue = gender || "Male";
  const pValue = price || 10000;
  const categoryName = category || "shoes";


  const categoryDoc = await Category.findOne({ name: categoryName });
  if (!categoryDoc) {
    return res.status(404).json(new ApiResponse(404, "Category not found", null));
  }


  const product = await Product.find({
    for: genderValue,
    price: { $gte: pValue - 1000, $lte: pValue + 1000 },
    category: categoryDoc._id,
  })
    .limit(4)
    .populate("imageSet", "thumbnail hover");

  res.status(200).json(
    new ApiResponse(200, "Shoes fetched successfully", product)
  );
});

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
  console.log("request for :" , category , " shoes");
  
  const categoryName = category || "shoes";
  const max = Number(limit) || 10;

  if (!categoryName) {
    return res.status(400).json(
      new ApiResponse(400, "Category query parameter is required")
    );
  }

  const categoryDoc = await Category.findOne({ name: categoryName });

  if (!categoryDoc) {
    return res.status(404).json(
      new ApiResponse(404, `Category '${categoryName}' not found`, null)
    );
  }

  const products = await Product.find({ category: categoryDoc._id })
    .limit(max)
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
