import type { Request, Response } from 'express';

import { uploadToCloudinary } from '../../../infrastructure/middlewares/upload.middleware.js';
import { ApiResponse } from '../../../shared/responses/api-response.builder.js';
import { asyncHandler } from '../../../shared/utils/async-handler.util.js';
import {
    getPaginationMeta,
    getPaginationParams,
} from '../../../shared/utils/pagination.util.js';
import { ProductImage } from '../repositories/product-image.model.js';

interface UploadedImages {
    thumbnail?: string;
    hover?: string;
    sides?: string[];
}

export const addProductImageById = asyncHandler(
    async (req: Request, res: Response) => {
        const { productId } = req.params;
        const files = req.files as
            | Record<string, Express.Multer.File[]>
            | undefined;
        const uploadedImages: UploadedImages = {};

        if (files?.thumbnail?.[0]) {
            const result = await uploadToCloudinary(
                files.thumbnail[0].buffer,
                'ecommerce_products',
            );
            uploadedImages.thumbnail = result.secure_url;
        }

        if (files?.hover?.[0]) {
            const result = await uploadToCloudinary(
                files.hover[0].buffer,
                'ecommerce_products',
            );
            uploadedImages.hover = result.secure_url;
        }

        if (files?.sides?.length) {
            uploadedImages.sides = [];
            for (const side of files.sides) {
                const result = await uploadToCloudinary(
                    side.buffer,
                    'ecommerce_products',
                );
                uploadedImages.sides.push(result.secure_url);
            }
        }

        const productImage = await ProductImage.findOneAndUpdate(
            { productId },
            { $set: uploadedImages, productId },
            { new: true, upsert: true },
        );

        res.status(200).json(
            new ApiResponse(
                200,
                'Images uploaded & saved successfully',
                productImage,
            ),
        );
    },
);

export const getProductImage = asyncHandler(
    async (req: Request, res: Response) => {
        const { page, limit, skip } = getPaginationParams(
            (req.query as Record<string, unknown>) ?? {},
            { limit: 20, maxLimit: 100 },
        );

        const [items, totalItems] = await Promise.all([
            ProductImage.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            ProductImage.countDocuments(),
        ]);

        return res.status(200).json(
            new ApiResponse(200, 'productImage fetched successfully', {
                items,
                pagination: getPaginationMeta(page, limit, totalItems),
            }),
        );
    },
);
