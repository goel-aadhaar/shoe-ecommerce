import dotenv from 'dotenv';

dotenv.config();

export type AppConfig = {
    nodeEnv: string;
    port: number;
    mongoUri: string;
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiry?: string;
    refreshTokenExpiry?: string;
    stripeSecretKey?: string;
    geminiApiKey?: string;
    cloudinary?: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    corsAllowedOrigins: string[];
    rateLimit?: {
        windowMs: number;
        max: number;
    };
};

function requireEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing required env var: ${name}`);
    return v;
}

export const config: AppConfig = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 5000),
    mongoUri: requireEnv('MONGODB_URI'),
    accessTokenSecret: requireEnv('ACCESS_TOKEN_SECRET'),
    refreshTokenSecret: requireEnv('REFRESH_TOKEN_SECRET'),
    ...(process.env.ACCESS_TOKEN_EXPIRY
        ? { accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY }
        : {}),
    ...(process.env.REFRESH_TOKEN_EXPIRY
        ? { refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY }
        : {}),
    ...(process.env.STRIPE_SECRET_KEY
        ? { stripeSecretKey: process.env.STRIPE_SECRET_KEY }
        : {}),
    ...(process.env.GEMINI_API_KEY
        ? { geminiApiKey: process.env.GEMINI_API_KEY }
        : {}),
    ...(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
        ? {
              cloudinary: {
                  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                  apiKey: process.env.CLOUDINARY_API_KEY,
                  apiSecret: process.env.CLOUDINARY_API_SECRET,
              },
          }
        : {}),
    corsAllowedOrigins: (
        process.env.CORS_ALLOWED_ORIGINS ??
        'https://shoe-ecommerce-mu.vercel.app,https://urbansole-pi.vercel.app,http://localhost:3000,http://localhost:5173'
    )
        .split(',')
        .map((s) => s.trim()),
    rateLimit: {
        windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
        max: Number(process.env.RATE_LIMIT_MAX ?? 300),
    },
};
