import jwt from "jsonwebtoken";
import { User } from "../models/model-export.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"; // assuming you have this

// Authentication Middleware
export const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookie or Bearer header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      throw new ApiError(401, "Unauthorized, token missing");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // decoded._id is what we expect (since we signed with { _id: user._id })
    const user = await User.findById(decoded._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Unauthorized, user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Unauthorized, invalid token", [error.message]));
    }
    next(error);
  }
});

// Admin Authorization Middleware
export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    next(new ApiError(403, "Access denied, admin only"));
  }
};
