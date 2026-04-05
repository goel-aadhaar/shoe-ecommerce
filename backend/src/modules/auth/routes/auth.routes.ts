import { Router } from 'express';

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

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authMiddleware, logout);
router.get('/check', optionalAuthMiddleware, checkAuth);
router.post('/refresh', refreshToken);

export default router;
