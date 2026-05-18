import { config } from '../../config.js';

const DAY = 24 * 60 * 60 * 1000;

export const ACCESS_COOKIE_MAX_AGE = DAY; // matches default access token expiry
export const REFRESH_COOKIE_MAX_AGE = 7 * DAY;

export const getCookieOptions = (
    maxAge: number = REFRESH_COOKIE_MAX_AGE,
): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'none' | 'lax' | 'strict';
    path: string;
    maxAge: number;
} => ({
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge,
});
