import { ApiResponse } from "../utils/ApiResponse.js";

export const errorMiddleware = (err, req, res, next) => {
    console.error("❌ Error:", err);

    const statusCode = err.statusCode || 500;

    // Ensure CORS headers are included even on errors
    res.header("Access-Control-Allow-Origin", "https://shoe-ecommerce-mu.vercel.app");
    res.header("Access-Control-Allow-Credentials", "true");

    res.status(statusCode).json(
        new ApiResponse(
            statusCode,
            err.message || "Internal Server Error",
            process.env.NODE_ENV === "production"
                ? { stack: null }
                : { stack: err.stack }
        )
    );
};
