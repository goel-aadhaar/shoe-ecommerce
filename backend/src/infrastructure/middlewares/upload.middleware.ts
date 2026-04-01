import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';

import { config } from '../../config.js';

if (config.cloudinary) {
    cloudinary.config({
        cloud_name: config.cloudinary.cloudName,
        api_key: config.cloudinary.apiKey,
        api_secret: config.cloudinary.apiSecret,
    });
}

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadToCloudinary = (
    buffer: Buffer,
    folder: string,
): Promise<UploadApiResponse> => {
    return new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) return reject(error);
                resolve(result!);
            },
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};
