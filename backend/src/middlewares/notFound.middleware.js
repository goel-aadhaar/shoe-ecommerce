import { ApiError } from "../utils/ApiError.js";

export const notFoundMiddleware = (req, res, next) => {
    // Make sure CORS headers are present for 404 too
    res.header("Access-Control-Allow-Origin", "https://shoe-ecommerce-mu.vercel.app");
    res.header("Access-Control-Allow-Credentials", "true");

    next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};
