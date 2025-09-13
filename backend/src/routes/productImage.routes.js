import express from "express";
import {upload} from "../middlewares/upload.middleware.js"; // multer middleware
import { addProductImageById , getProductImage} from "../controllers/productImage.controller.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";
import { get } from "mongoose";

const router = express.Router();

// Upload images for a product
router.post(
  "/:productId/images",
    authMiddleware,
    adminMiddleware,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "hover", maxCount: 1 },
        { name: "sides", maxCount: 5 },
    ]),
    addProductImageById
);
router.get("/", getProductImage);

export default router;
