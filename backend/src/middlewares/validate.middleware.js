import { ApiError } from "../utils/ApiError.js";

export const validateMiddleware = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const details = error.details.map((d) => d.message);

            return next(new ApiError(400, "Validation error", details));
        }

        next();
    };
};
