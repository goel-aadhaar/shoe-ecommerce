import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import mongoose, { type Document, type Model, Schema } from 'mongoose';

import { config } from '../../../config.js';

export interface IUser {
    fullName: string;
    email: string;
    password: string;
    role: 'customer' | 'admin';
    refreshToken: string | null;
}

export interface IUserMethods {
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

export type UserDocument = Document & IUser & IUserMethods;
type UserModel = Model<IUser, object, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer',
        },
        refreshToken: {
            type: String,
            default: null,
        },
    },
    { timestamps: true },
);

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } else {
        return next();
    }
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jsonwebtoken.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
        },
        config.accessTokenSecret,
        { expiresIn: (config.accessTokenExpiry ?? '1d') as string & jsonwebtoken.SignOptions['expiresIn'] },
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jsonwebtoken.sign(
        { _id: this._id },
        config.refreshTokenSecret,
        { expiresIn: (config.refreshTokenExpiry ?? '10d') as string & jsonwebtoken.SignOptions['expiresIn'] },
    );
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);
