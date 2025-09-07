import { Router } from "express";
import { getMyReviews } from "../controllers/review.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", authMiddleware, getMyReviews);

export default router;
