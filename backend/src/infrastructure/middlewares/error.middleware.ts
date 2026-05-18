import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { ApiError } from '../../shared/errors/api-error.class.js';
import { ApiResponse } from '../../shared/responses/api-response.builder.js';

type ErrorLike = Error & {
    statusCode?: number;
    code?: number;
    errors?: unknown;
    keyValue?: Record<string, unknown>;
};

export const errorMiddleware = (
    err: ErrorLike | ApiError,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    let statusCode = 500;
    let message = err.message || 'Internal Server Error';
    let details: unknown;

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        details = err.errors;
    } else if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validation error';
        details = err.issues;
    } else if (err.name === 'ValidationError') {
        // Mongoose schema validation
        statusCode = 400;
    } else if (err.name === 'CastError') {
        // e.g. malformed ObjectId in a route param
        statusCode = 400;
        message = 'Invalid identifier';
    } else if (err.code === 11000) {
        // Mongo duplicate key
        statusCode = 409;
        message = `Duplicate value for ${Object.keys(
            (err as ErrorLike).keyValue ?? {},
        ).join(', ') || 'a unique field'}`;
    } else if (typeof (err as ErrorLike).statusCode === 'number') {
        statusCode = (err as ErrorLike).statusCode as number;
    }

    // Surface unexpected server faults in the logs (they were silent before).
    if (statusCode >= 500) {
        console.error(`[error] ${statusCode} ${message}`, err.stack);
    }

    const isProd = process.env.NODE_ENV === 'production';

    res.status(statusCode).json(
        new ApiResponse(
            statusCode,
            isProd && statusCode >= 500 ? 'Internal Server Error' : message,
            isProd ? null : { stack: err.stack, details },
        ),
    );
};
