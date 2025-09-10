import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        id : {
            type : Number,
            require: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: { 
            type: String,
            default: "Ek Number Product Hai Khareed Lo Bhai...."
        },
        brand: { 
            type: String,
            default : "Pexaro"
        },
        price: {
            type: Number,
            required: true,
        },
        stock: {
            type: Number,
            min: 1,
            required: true,
            default: 0,
        },
        for: {
            type: String,
            enum: ["male", "female"], // only allowed values
            required: true,
        },
        color: { 
            type: String,
            default: "SAIL/BURGUNDY CRUSH-BLACK"
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        rating:{
            type: Number,
            required: false,
            default: 3.7,
        },
        ratedBy:{
            type: Number,
            required: false,
            default : 135,
        },
        attributes: {
            type: [String], 
            enum: ["newArrival", "trending", "bestSeller", "onSale"],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export const Product = mongoose.model("Product", productSchema);
