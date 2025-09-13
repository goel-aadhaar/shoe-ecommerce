// // import { Product } from "../src/models/product.model.js";
// // import connectDB from "../src/db/connectDB.js";
// // import dotenv from "dotenv";
// // dotenv.config();


// // const backfillImageSet = async () => {
// //   await connectDB();

// //   const result = await Product.updateMany(
// //     { imageSet: { $exists: false } },
// //     { $set: { imageSet: null } }
// //   );

// //   console.log("Updated docs:", result.modifiedCount);
// //   process.exit();
// // };

// // backfillImageSet();
// import mongoose from "mongoose";
// import { Product } from "../src/models/product.model.js";
// import { ProductImage } from "../src/models/productImage.model.js";
// import connectDB from "../src/db/connectDB.js";
// import dotenv from "dotenv";
// dotenv.config();


// // 1. Connect to your MongoDB
// // const MONGODB_URI = "your_mongo_connection_string_here";

// // mongoose.connect(MONGODB_URI, {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true,
// // });
// connectDB();
// mongoose.connection.once("open", async () => {
//   console.log("MongoDB connected. Starting backfill...");

//   try {
//     const images = await ProductImage.find();

//     for (let img of images) {
//       const product = await Product.findById(img.productId);

//       if (product) {
//         product.imageSet = img._id;
//         await product.save();
//         console.log(`Linked ProductImage ${img._id} to Product ${product._id}`);
//       } else {
//         console.warn(`No product found for ProductImage ${img._id}`);
//       }
//     }

//     console.log("Backfill complete!");
//     process.exit(0);
//   } catch (error) {
//     console.error("Error during backfill:", error);
//     process.exit(1);
//   }
// });
