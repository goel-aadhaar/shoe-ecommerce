import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";
// import dotenv from "dotenv";
// dotenv.config();

const connectDB = async () => {
    console.log("MONGODB_URI from env:", process.env.MONGODB_URI);
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MONGODB CONNECTED: ${connectionInstance}`);
        console.log("Host:", connectionInstance.connection.host);
        console.log("Port:", connectionInstance.connection.port);
        console.log("Name:", connectionInstance.connection.name);
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED: " , error);
        process.exit(1);
    }
}

export default connectDB;