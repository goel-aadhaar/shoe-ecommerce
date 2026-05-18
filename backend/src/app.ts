import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { config } from './config.js';
import { logger } from './infrastructure/logger/logger.js';
import { errorMiddleware } from './infrastructure/middlewares/error.middleware.js';
import { notFoundMiddleware } from './infrastructure/middlewares/notFound.middleware.js';
import { stripeWebhook } from './modules/payment/services/payment.service.js';
import apiRouter from './routes.js';
import { ApiError } from './shared/errors/api-error.class.js';
import { swaggerRouter } from './swagger/swagger.router.js';

const app = express();

const allowedOrigins = config.corsAllowedOrigins;

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());

app.use(
    rateLimit({
        windowMs: config.rateLimit?.windowMs ?? 15 * 60 * 1000,
        max: config.rateLimit?.max ?? 300,
        standardHeaders: true,
        legacyHeaders: false,
    }),
);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (!allowedOrigins.includes(origin)) {
                return callback(
                    new ApiError(403, `CORS blocked: ${origin}`),
                    false,
                );
            }
            callback(null, true);
        },
        methods: 'GET,POST,PUT,DELETE,PATCH',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

// Stripe webhook needs the raw, unparsed body for signature verification,
// so it is mounted BEFORE express.json().
app.post(
    '/api/v1/payments/webhook',
    express.raw({ type: 'application/json' }),
    stripeWebhook,
);

app.use(express.json({ limit: '1mb' }));
app.use(logger);
app.use(cookieParser());

app.use('/docs', swaggerRouter);

app.use('/api/v1', apiRouter);

app.get('/', (_req, res) => {
    res.send(' Shoe E-Commerce API is running...');
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
