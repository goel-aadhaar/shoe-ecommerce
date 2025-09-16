import { ApiResponse } from "../utils/ApiResponse.js";

export const errorMiddleware = (err, req, res, next) => {
    console.error("❌ Error:", err);

    const statusCode = err.statusCode || 500;
    const allowedOrigins = [
        "https://shoe-ecommerce-mu.vercel.app",
        "https://urbansole-pi.vercel.app"
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

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
