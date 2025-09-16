import { Router } from "express";
import { getCart, addToCart, removeFromCart } from "../controllers/cart.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);
router.delete("/:id", authMiddleware, removeFromCart);
router.delete("/clear",authMiddleware, clearCart);  

export default router;
