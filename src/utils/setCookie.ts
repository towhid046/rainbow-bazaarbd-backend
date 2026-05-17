import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const setCookie = async (req: Request, res: Response) => {
    try {
        const { email } = req.body; // Extract user details from request body (or use req.user if authenticated)

        if (!email) {
            res.status(400).json({ message: "User Email is required" });
            return;
        }

        // Generate JWT token
        const token = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: "7d" });

        // Set HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
            sameSite: "none", // For cross-origin requests
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export default setCookie;
