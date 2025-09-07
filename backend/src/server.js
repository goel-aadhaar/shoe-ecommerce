import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import routes from "./routes/route-combiner.js";
import { logger } from "./utils/logger.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cors from "cors";

dotenv.config();

// Connect to database
connectDB();

const app = express();

app.use(cors({
  origin: 'https://shoe-ecommerce-mu.vercel.app',  // your frontend URL (Vite dev server)
  methods: 'GET,POST,PUT,DELETE,PATCH',
  credentials: true,                 // if you use cookies or auth
}));

// Middleware
app.use(express.json()); // parse JSON body
app.use(logger);         // request logging

// API Routes
app.use("/api/v1", routes);

// Health check route
app.get("/", (req, res) => {
    res.send("✅ Shoe E-Commerce API is running...");
});

// Not Found + Error Handlers
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app; // useful for testing
