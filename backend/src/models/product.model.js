import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "Ek Number Product Hai Khareed Lo Bhai....",
    },
    brand: {
      type: String,
      default: "Pexaro",
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      min: 0,
      required: true,
      default: 0,
    },
    for: {
      type: String,
      enum: ["Male", "Female"], // only allowed values
      required: true,
    },
    color: {
      type: String,
      default: "SAIL/BURGUNDY CRUSH-BLACK",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    rating: {
      type: Number,
      default: 3.7,
    },
    ratedBy: {
      type: Number,
      default: 135,
    },
    attributes: {
      type: [String],
      enum: ["newArrival", "trending", "bestSeller", "onSale"],
      default: [],
    },
    imageSet: {
      type: Schema.Types.ObjectId,
      ref: "ProductImage",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
