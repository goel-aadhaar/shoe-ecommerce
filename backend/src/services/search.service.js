// A simple text-based search service (can replace with Trie or Mongo text index)
import { Product } from "../models/index.js";

export const searchProducts = async (query) => {
    const regex = new RegExp(query, "i"); // case-insensitive search
    return await Product.find({
        $or: [{ name: regex }, { description: regex }],
    });
};
