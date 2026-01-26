import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';

import dotenv from 'dotenv';
import { generateAndStoreEmbedding } from '../src/services/embedding.service.js'; 
// import connectDB from "../src/db/connectDB.js";

dotenv.config();

// Configuration
const CSV_FILE_PATH = './scripts/id_desc.csv'; // <--- UPDATE THIS
const MONGO_URI = process.env.MONGODB_URI; 

// A helper to pause execution (prevents rate limiting)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function importData() {

    try {
        await mongoose.connect(MONGO_URI);
        // await connectDB();
        console.log("✅ Connected to MongoDB");

        const rows = [];

        // 1. Read the CSV file completely first
        fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', async () => {
            console.log(`📂 CSV Loaded. Found ${rows.length} rows. Starting processing...`);
            
            // 2. Loop through rows one by one
            for (const [index, row] of rows.entries()) {
            // ASSUMPTION: Your CSV headers are "id" and "description"
            const shoeId = row.id; 
            const desc = row.description;

            if (!shoeId || !desc) {
                console.log(`⚠️ Skipping row ${index}: Missing id or description`);
                continue;
            }

            try {
                console.log(`[${index + 1}/${rows.length}] Processing shoe: ${shoeId}`);
                
                // Call your service to generate vector + save to DB
                await generateAndStoreEmbedding(shoeId, desc);

                // 🕒 WAIT 1 second between requests to be nice to the free API
                await sleep(1500); 

            } catch (err) {
                console.error(`❌ Failed row ${index}:`, err.message);
            }
            }

            console.log("🎉 All Done! You can now exit the script.");
            process.exit(0);
        });

    } catch (error) {
        console.error("Critical Error:", error);
        process.exit(1);
    }
}

importData();