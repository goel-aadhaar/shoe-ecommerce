import jwt from "jsonwebtoken";
import { User } from "../models/model-export.js";
import { ApiError } from "../utils/ApiError.js";

// Authentication Middleware
export const authMiddleware = async (req, res, next) => {
    try {
       const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new ApiError(401, "Unauthorized, token missing");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            throw new ApiError(401, "Unauthorized, user not found");
        }

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return next(new ApiError(401, "Unauthorized, invalid token", [error.message]));
        }

        next(error);  // Pass other errors to the global error handler
    }
};

// Admin Authorization Middleware
export const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        next(new ApiError(403, "Access denied, admin only"));
    }
};
