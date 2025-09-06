import { User } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ success: true, message: "User registered", data: user });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.json({ success: true, message: "Login successful", token });
});

export const logout = asyncHandler(async (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
});
