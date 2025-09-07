import { Router } from "express";
import { createCategory, getCategories } from "../controllers/category.controller.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, adminMiddleware, createCategory);
router.get("/", getCategories);

export default router;
