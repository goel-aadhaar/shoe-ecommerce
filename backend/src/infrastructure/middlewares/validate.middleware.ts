import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

import { ApiError } from '../../shared/errors/api-error.class.js';

export const validate =
    (schema: ZodTypeAny) =>
    (req: Request, _res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            }) as { body?: unknown; query?: unknown; params?: unknown };

            if (parsed.body !== undefined) req.body = parsed.body;
            if (parsed.query !== undefined)
                Object.assign(req.query, parsed.query);
            if (parsed.params !== undefined)
                Object.assign(req.params, parsed.params as Record<string, string>);

            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return next(new ApiError(400, 'Validation error', err.issues));
            }
            next(err);
        }
    };
