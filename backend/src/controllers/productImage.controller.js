import Product from "../models/product.model.js";
import { ProductImage } from "../models/productImage.model.js";
import cloudinary from "../config/cloudinary.js";
import {asyncHandler}  from "../utils/asyncHandler.js";

// @desc    Add product images for a product
// @route   POST /api/v1/product-images/:productId/images
// @access  Admin
export const addProductImageById = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    // 1. Check product exists
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
     
    // 2. Prepare URLs
    let thumbnailUrl = null;
    let hoverUrl = null;
    let sideUrls = [];

    if (req.files?.thumbnail) {
        const uploadRes = await cloudinary.uploader.upload(
            req.files.thumbnail[0].path,
            { folder: "products" }
        );
        thumbnailUrl = uploadRes.secure_url;
    }

    if (req.files?.hover) {
        const uploadRes = await cloudinary.uploader.upload(
            req.files.hover[0].path,
            { folder: "products" }
        );
        hoverUrl = uploadRes.secure_url;
    }

    if (req.files?.sides) {
        for (const file of req.files.sides) {
            const uploadRes = await cloudinary.uploader.upload(file.path, {
                folder: "products",
            });
            sideUrls.push(uploadRes.secure_url);
        }
    }

    // 3. Create ProductImage doc
    const productImage = await ProductImage.create({
        productId,
        thumbnail: thumbnailUrl,
        hover: hoverUrl,
        sides: sideUrls,
    });

    // 4. Link Product -> ProductImage
    product.imageSet = productImage._id;
    await product.save();

    res.status(201).json({
        message: "Product images added successfully",
        productImage,
    });
});
