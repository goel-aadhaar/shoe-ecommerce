import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import routes from "./routes/route-combiner.js";
import { logger } from "./utils/logger.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

connectDB();

const app = express();
const alloowedOrigins = [
  "https://shoe-ecommerce-mu.vercel.app",
  "https://localhost:5137",
  "http://localhost:3000"
];

app.use(
  cors({
    // origin: ["https://shoe-ecommerce-mu.vercel.app","https://localhost:5137","http://localhost:3000"],
    origin: function(origin, callback){
      // allow requests with no origin 
      // (like mobile apps or curl requests) 
      if(!origin) return callback(null, true);
      if(alloowedOrigins.indexOf(origin) === -1){
        var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }else{
        return callback(null, true);
      }
    },
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(logger);
app.use(cookieParser());

app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.send(" Shoe E-Commerce API is running...");
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
