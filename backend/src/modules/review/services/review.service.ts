import type { Request, Response } from 'express';

import { ApiResponse } from '../../../shared/responses/api-response.builder.js';
import { asyncHandler } from '../../../shared/utils/async-handler.util.js';
import {
    getPaginationMeta,
    getPaginationParams,
} from '../../../shared/utils/pagination.util.js';
import { Review } from '../repositories/review.model.js';

export const getMyReviews = asyncHandler(
    async (req: Request, res: Response) => {
        const { page, limit, skip } = getPaginationParams(
            (req.query as Record<string, unknown>) ?? {},
            { limit: 10, maxLimit: 50 },
        );

        const filter = { userId: req.user?._id };

        const [items, totalItems] = await Promise.all([
            Review.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('productId'),
            Review.countDocuments(filter),
        ]);

        return res.status(200).json(
            new ApiResponse(200, 'Reviews fetched successfully', {
                items,
                pagination: getPaginationMeta(page, limit, totalItems),
            }),
        );
    },
);
