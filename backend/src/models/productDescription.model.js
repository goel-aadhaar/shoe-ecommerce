// const mongoose = require('mongoose');
import mongoose from "mongoose";

const ProductDescriptionSchema = new mongoose.Schema({
    shoe_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Links to your main Product collection
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    embedding_description: {
        type: [Number], // <--- This is where the magic happens
        required: true,
        index: true // Optional: Good practice for performance
    }
}, { timestamps: true });

// module.exports = mongoose.model('ProductDescription', ProductDescriptionSchema);
// export const Review = mongoose.model("Review", reviewSchema);

// export default mongoose.model('ProductDescription', ProductDescriptionSchema);
export const ProductDescription = mongoose.model('ProductDescription', ProductDescriptionSchema);