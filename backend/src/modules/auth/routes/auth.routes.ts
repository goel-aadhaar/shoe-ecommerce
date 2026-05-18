import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import {
    authMiddleware,
    optionalAuthMiddleware,
} from '../../../infrastructure/middlewares/auth.middleware.js';
import { validate } from '../../../infrastructure/middlewares/validate.middleware.js';
import {
    checkAuth,
    login,
    logout,
    refreshToken,
    register,
} from '../services/auth.service.js';
import { loginSchema, registerSchema } from '../validators/auth.validators.js';

const router = Router();

// Strict limiter for credential endpoints (brute-force protection).
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        statusCode: 429,
        message: 'Too many attempts. Please try again later.',
        success: false,
        data: null,
    },
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', authMiddleware, logout);
router.get('/check', optionalAuthMiddleware, checkAuth);
router.post('/refresh', refreshToken);

export default router;
