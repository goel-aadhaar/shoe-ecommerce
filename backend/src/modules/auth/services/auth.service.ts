import { createHash } from 'node:crypto';

import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../../../config.js';
import { ApiError } from '../../../shared/errors/api-error.class.js';
import { ApiResponse } from '../../../shared/responses/api-response.builder.js';
import { asyncHandler } from '../../../shared/utils/async-handler.util.js';
import {
    ACCESS_COOKIE_MAX_AGE,
    getCookieOptions,
} from '../../../shared/utils/cookie.util.js';
import { User, type UserDocument } from '../../user/repositories/user.model.js';

// Refresh tokens are stored hashed; a leaked DB cannot replay them.
const hashToken = (token: string) =>
    createHash('sha256').update(token).digest('hex');

const generateAccessAndRefreshTokens = async (userId: string) => {
    const user = (await User.findById(userId)) as UserDocument | null;
    if (!user) {
        throw new ApiError(
            500,
            'Something went wrong while generating refresh and access token',
        );
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, password } = req.body ?? {};

    if ([fullName, email, password].some((field) => !field?.trim())) {
        throw new ApiError(400, 'All fields are compulsory');
    }

    const userExists = await User.findOne({ email });
    if (userExists) throw new ApiError(400, 'User already exists');

    const user = await User.create({ fullName, email, password });
    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken',
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            'Something went wrong while registering a user',
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, 'User Registered Successfully', createdUser),
        );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email) throw new ApiError(400, 'Email is required');

    const user = (await User.findOne({ email })) as UserDocument | null;
    // Generic message for both cases — avoids leaking which emails exist.
    if (!user) throw new ApiError(401, 'Invalid email or password');

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        String(user._id),
    );

    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshToken',
    );

    return res
        .status(200)
        .cookie(
            'accessToken',
            accessToken,
            getCookieOptions(ACCESS_COOKIE_MAX_AGE),
        )
        .cookie('refreshToken', refreshToken, getCookieOptions())
        .json(
            new ApiResponse(200, 'User logged In Successfully', {
                user: loggedInUser,
                accessToken,
                refreshToken,
            }),
        );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        { $unset: { refreshToken: 1 } },
        { new: true },
    );

    const options = getCookieOptions();

    return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, 'User logged Out', {}));
});

export const checkAuth = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        return res
            .status(200)
            .json(new ApiResponse(200, 'Not logged in', { isLoggedIn: false }));
    }

    return res.status(200).json(
        new ApiResponse(200, 'User is logged in', {
            isLoggedIn: true,
            userId: req.user._id,
        }),
    );
});

export const refreshToken = asyncHandler(
    async (req: Request, res: Response) => {
        const incomingRefreshToken =
            req.cookies?.refreshToken ||
            req.header('Authorization')?.replace('Bearer ', '').trim();

        if (!incomingRefreshToken) {
            throw new ApiError(401, 'Refresh token is required');
        }

        let decoded: { _id: string };
        try {
            decoded = jwt.verify(
                incomingRefreshToken,
                config.refreshTokenSecret,
            ) as { _id: string };
        } catch {
            throw new ApiError(401, 'Invalid or expired refresh token');
        }

        const user = (await User.findById(decoded._id)) as UserDocument | null;
        if (!user) {
            throw new ApiError(401, 'Invalid refresh token');
        }

        if (user.refreshToken !== hashToken(incomingRefreshToken)) {
            throw new ApiError(401, 'Refresh token is expired or used');
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshTokens(String(user._id));

        return res
            .status(200)
            .cookie(
                'accessToken',
                accessToken,
                getCookieOptions(ACCESS_COOKIE_MAX_AGE),
            )
            .cookie('refreshToken', newRefreshToken, getCookieOptions())
            .json(
                new ApiResponse(200, 'Tokens refreshed successfully', {
                    accessToken,
                    refreshToken: newRefreshToken,
                }),
            );
    },
);
