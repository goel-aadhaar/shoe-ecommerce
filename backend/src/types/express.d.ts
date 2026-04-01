import 'express';

export interface AuthenticatedUser {
    _id: string;
    fullName: string;
    email: string;
    role: 'customer' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: AuthenticatedUser;
    }
}
