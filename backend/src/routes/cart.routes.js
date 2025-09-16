import { Router } from "express";
import { getCart, 
        addToCart, 
        removeFromCart,
        clearCart } from "../controllers/cart.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);
router.delete("/userCart/clear",authMiddleware, clearCart);  
router.delete("/:id", authMiddleware, removeFromCart);


export default router;
