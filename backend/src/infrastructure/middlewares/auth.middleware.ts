import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../../config.js';
import { User } from '../../modules/user/repositories/user.model.js';
import { ApiError } from '../../shared/errors/api-error.class.js';
import { asyncHandler } from '../../shared/utils/async-handler.util.js';

interface JwtPayload {
    _id: string;
    email: string;
    fullName: string;
}

export const authMiddleware = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const token =
                req.cookies?.accessToken ||
                req.header('Authorization')?.replace('Bearer ', '').trim();

            if (!token) throw new ApiError(401, 'Unauthorized, token missing');

            const decoded = jwt.verify(
                token,
                config.accessTokenSecret,
            ) as JwtPayload;
            const user = await User.findById(decoded._id).select(
                '-password -refreshToken',
            );

            if (!user) throw new ApiError(401, 'Unauthorized, user not found');

            (req as { user?: Request['user'] }).user = user as unknown as Request['user'];
            next();
        } catch (error: unknown) {
            if (
                error instanceof Error &&
                error.name === 'JsonWebTokenError'
            ) {
                return next(
                    new ApiError(401, 'Unauthorized, invalid token', [
                        error.message,
                    ]),
                );
            }
            next(error);
        }
    },
);

export const adminMiddleware = (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    if (req.user && req.user.role === 'admin') return next();
    next(new ApiError(403, 'Access denied, admin only'));
};
