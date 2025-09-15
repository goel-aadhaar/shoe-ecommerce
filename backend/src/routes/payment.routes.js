import { Router } from "express";
import { createStripePayment, confirmPayment } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/stripe", authMiddleware, createStripePayment);
router.post("/confirm", authMiddleware, confirmPayment);

export default router;
