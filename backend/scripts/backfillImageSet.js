// import { Product } from "../src/models/product.model.js";
// import connectDB from "../src/db/connectDB.js";
// import dotenv from "dotenv";
// dotenv.config();


// const backfillImageSet = async () => {
//   await connectDB();

//   const result = await Product.updateMany(
//     { imageSet: { $exists: false } },
//     { $set: { imageSet: null } }
//   );

//   console.log("Updated docs:", result.modifiedCount);
//   process.exit();
// };

// backfillImageSet();
