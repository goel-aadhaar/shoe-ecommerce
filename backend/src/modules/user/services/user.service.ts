import type { Request, Response } from 'express';

import { ApiError } from '../../../shared/errors/api-error.class.js';
import { ApiResponse } from '../../../shared/responses/api-response.builder.js';
import { asyncHandler } from '../../../shared/utils/async-handler.util.js';
import {
    getPaginationMeta,
    getPaginationParams,
} from '../../../shared/utils/pagination.util.js';
import { Favourite } from '../repositories/favourite.model.js';
import { Profile } from '../repositories/profile.model.js';
import { User } from '../repositories/user.model.js';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const profile = await Profile.findOne({ userId });
    const user = await User.findById(userId).select('-password');

    if (!user) throw new ApiError(404, 'User not found');

    res.status(200).json(
        new ApiResponse(200, 'User fetched successfully', {
            user,
            profile,
        }),
    );
});

export const updateProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        // Only allow known profile fields to prevent field injection
        const {
            fullname,
            phone,
            address,
            city,
            state,
            country,
            pincode,
            profileImage,
        } = req.body ?? {};
        const updateData: Record<string, unknown> = {};
        if (fullname !== undefined) updateData.fullname = fullname;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (state !== undefined) updateData.state = state;
        if (country !== undefined) updateData.country = country;
        if (pincode !== undefined) updateData.pincode = pincode;
        if (profileImage !== undefined) updateData.profileImage = profileImage;

        const profile = await Profile.findOneAndUpdate({ userId }, updateData, {
            new: true,
            upsert: true,
        });

        res.status(200).json(
            new ApiResponse(200, 'Profile updated successfully', profile),
        );
    },
);

export const addFavourite = asyncHandler(
    async (req: Request, res: Response) => {
        const fav = await Favourite.create({
            userId: req.user?._id,
            productId: req.body?.productId,
        });

        res.status(201).json(
            new ApiResponse(201, 'Added to favourites successfully', fav),
        );
    },
);

export const getFavourites = asyncHandler(
    async (req: Request, res: Response) => {
        const { page, limit, skip } = getPaginationParams(
            (req.query as Record<string, unknown>) ?? {},
            { limit: 20, maxLimit: 100 },
        );

        const filter = { userId: req.user?._id };
        const [items, totalItems] = await Promise.all([
            Favourite.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('productId'),
            Favourite.countDocuments(filter),
        ]);

        return res.status(200).json(
            new ApiResponse(200, 'Favourites fetched successfully', {
                items,
                pagination: getPaginationMeta(page, limit, totalItems),
            }),
        );
    },
);

export const removeFavourite = asyncHandler(
    async (req: Request, res: Response) => {
        await Favourite.findOneAndDelete({
            userId: req.user?._id,
            productId: req.params.id,
        });

        res.status(200).json(
            new ApiResponse(200, 'Removed from favourites successfully', null),
        );
    },
);
