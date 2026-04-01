import type { NextFunction, Request, Response } from 'express';

export const asyncHandler =
    (
        requestHandler: (
            req: Request,
            res: Response,
            next: NextFunction,
        ) => Promise<unknown>,
    ) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await requestHandler(req, res, next);
        } catch (error) {
            next(error);
        }
    };
