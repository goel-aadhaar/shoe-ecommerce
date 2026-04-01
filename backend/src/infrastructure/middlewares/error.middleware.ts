import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../../shared/errors/api-error.class.js';
import { ApiResponse } from '../../shared/responses/api-response.builder.js';

export const errorMiddleware = (
    err: Error | ApiError,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    const statusCode =
        'statusCode' in err ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json(
        new ApiResponse(
            statusCode,
            message,
            process.env.NODE_ENV === 'production'
                ? null
                : { stack: err.stack },
        ),
    );
};
