import type { Request, Response } from 'express';

import { config } from '../../../config.js';
import { ApiError } from '../../../shared/errors/api-error.class.js';
import { ApiResponse } from '../../../shared/responses/api-response.builder.js';
import { asyncHandler } from '../../../shared/utils/async-handler.util.js';
import { getCookieOptions } from '../../../shared/utils/cookie.util.js';
import { User, type UserDocument } from '../../user/repositories/user.model.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (userId: string) => {
    const user = await User.findById(userId) as UserDocument | null;
    if (!user) {
        throw new ApiError(
            500,
            'Something went wrong while generating refresh and access token',
        );
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, password } = req.body ?? {};

    if ([fullName, email, password].some((field) => field?.trim?.() === '')) {
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

    const user = await User.findOne({ email }) as UserDocument | null;
    if (!user) throw new ApiError(404, 'User does not exist');

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, 'Invalid User credentials');

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        String(user._id),
    );

    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshToken',
    );

    const options = getCookieOptions();

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
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
            .status(401)
            .json(new ApiResponse(401, 'Not logged in', { isLoggedIn: false }));
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

        const decoded = jwt.verify(
            incomingRefreshToken,
            config.refreshTokenSecret,
        ) as { _id: string };

        const user = await User.findById(decoded._id) as UserDocument | null;
        if (!user) {
            throw new ApiError(401, 'Invalid refresh token');
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, 'Refresh token is expired or used');
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshTokens(String(user._id));

        const options = getCookieOptions();

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', newRefreshToken, options)
            .json(
                new ApiResponse(200, 'Tokens refreshed successfully', {
                    accessToken,
                    refreshToken: newRefreshToken,
                }),
            );
    },
);
