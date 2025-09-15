import { Router } from "express";
import { 
    createProduct,
    getProducts,
    getProductById,
    getProductsByAttribute,
    getProductsByBrand,
    getProductsByGender,
    getProductsByCategory,
    updateProduct, 
    deleteProduct, 
    addProductImage, 
    addReview, 
    getProductReviews
} from "../controllers/product.controller.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Products
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/filter/attribute", getProductsByAttribute);
router.get("/filter/brand",  getProductsByBrand);
router.get("/filter/gender", getProductsByGender);
router.get("/filter/category", getProductsByCategory);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

// Product images
router.post("/images", authMiddleware, adminMiddleware, addProductImage);

// Reviews
router.post("/reviews", authMiddleware, addReview);
router.get("/:id/reviews", getProductReviews);

export default router;
