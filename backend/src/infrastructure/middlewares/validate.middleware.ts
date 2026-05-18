import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

import { ApiError } from '../../shared/errors/api-error.class.js';

/**
 * In Express 5 `req.query` (and sometimes `req.params`) is exposed via a
 * getter with no setter, so `Object.assign(req.query, …)` silently fails to
 * persist Zod-coerced/defaulted values. Redefining the property on the
 * request instance shadows the getter and makes the validated data the
 * single source of truth for every downstream handler.
 */
function overrideRequestProp(
    req: Request,
    prop: 'query' | 'params',
    value: unknown,
) {
    Object.defineProperty(req, prop, {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
    });
}

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
                overrideRequestProp(req, 'query', parsed.query);
            if (parsed.params !== undefined)
                overrideRequestProp(req, 'params', parsed.params);

            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return next(new ApiError(400, 'Validation error', err.issues));
            }
            next(err);
        }
    };
