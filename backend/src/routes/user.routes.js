import { Router } from "express";
import { getProfile, updateProfile, addFavourite, getFavourites, removeFavourite } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Profile
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// Favourites
router.post("/favourites", authMiddleware, addFavourite);
router.get("/favourites", authMiddleware, getFavourites);
router.delete("/favourites/:id", authMiddleware, removeFavourite);

export default router;
