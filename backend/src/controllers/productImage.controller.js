import { ProductImage } from "../models/productImage.model.js";
import { uploadToCloudinary } from "../middlewares/upload.middleware.js";

export const addProductImageById = async (req, res) => {
  try {
    const { productId } = req.params;
    const files = req.files; // thumbnail, hover, sides
    const uploadedImages = {};

    if (files.thumbnail) {
      const result = await uploadToCloudinary(files.thumbnail[0].buffer, "ecommerce_products");
      uploadedImages.thumbnail = result.secure_url;
    }

    if (files.hover) {
      const result = await uploadToCloudinary(files.hover[0].buffer, "ecommerce_products");
      uploadedImages.hover = result.secure_url;
    }

    if (files.sides) {
      uploadedImages.sides = [];
      for (const side of files.sides) {
        const result = await uploadToCloudinary(side.buffer, "ecommerce_products");
        uploadedImages.sides.push(result.secure_url);
      }
    }

    // ✅ Upsert into ProductImage collection
    const productImage = await ProductImage.findOneAndUpdate(
      { productId },
      { $set: uploadedImages, productId },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Images uploaded & saved successfully!",
      productImage,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getProductImage = asyncHandler(async (req, res) => {
    const productImage = await ProductImage.find();
    res.status(201)
    .json(
        new ApiResponse(
            200,
            "productImage fetched successfully",
            productImage
        )
    )
});