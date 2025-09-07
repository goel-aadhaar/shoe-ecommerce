import { Router } from "express";
import { 
    createProduct, getProducts, getProductById, updateProduct, deleteProduct, 
    addProductImage, addReview, getProductReviews 
} from "../controllers/product.controller.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Products
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

// Product images
router.post("/images", authMiddleware, adminMiddleware, addProductImage);

// Reviews
router.post("/reviews", authMiddleware, addReview);
router.get("/:id/reviews", getProductReviews);

export default router;
