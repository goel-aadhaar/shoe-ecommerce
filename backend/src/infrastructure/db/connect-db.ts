import mongoose from 'mongoose';

import { config } from '../../config.js';

export default async function connectDB() {
    try {
        // MONGODB_URI must include the database name in the path
        // e.g. mongodb://host:27017/UrbanSole?w=majority
        const connectionInstance = await mongoose.connect(config.mongoUri);
         
        console.log('MONGODB CONNECTED:', connectionInstance.connection.host);
    } catch (error) {
         
        console.log('MONGODB CONNECTION FAILED: ', error);
        process.exit(1);
    }
}
