import { uploadToCloudinary } from "../middlewares/upload.middleware.js";
import {Product} from "../models/product.model.js";

export const addProductImageById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Upload thumbnail
    if (req.files.thumbnail) {
      const result = await uploadToCloudinary(req.files.thumbnail[0].buffer, "products");
      product.thumbnail = result.secure_url;
    }

    // Upload hover
    if (req.files.hover) {
      const result = await uploadToCloudinary(req.files.hover[0].buffer, "products");
      product.hover = result.secure_url;
    }

    // Upload sides
    if (req.files.sides) {
      product.sides = [];
      for (const file of req.files.sides) {
        const result = await uploadToCloudinary(file.buffer, "products");
        product.sides.push(result.secure_url);
      }
    }

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};
