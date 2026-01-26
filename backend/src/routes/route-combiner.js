import { Router } from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import cartRoutes from "./cart.routes.js";
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";
import reviewRoutes from "./review.routes.js";
import productImageRoutes from "./productImage.routes.js";
import { getProductDescriptions } from "../controllers/product.controller.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/product-images", productImageRoutes);

// Add route for productDescriptions
// router.get("/productDescriptions", getProductDescriptions);

export default router;
