import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { User } from "../models/User.model";
import { loginUserSchema, registerUserSchema } from "../schemas/User.schema";
import { generateToken, verifyGoogleToken } from "../utils/auth";

// Cookie options for cross-origin security
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Uses secure HTTPS in production
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
};

/**
 * Handle Traditional Email/Password Registration
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = registerUserSchema.parse(req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: "Email is already registered" });
      return;
    }

    const newUser = await User.create({
      name,
      email,
      password,
      authProvider: "credentials",
    });

    const token = generateToken(newUser._id.toString(), newUser.role);

    // Set token inside HTTP-only Cookie
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

/**
 * Handle Traditional Email/Password Login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginUserSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    if (user.authProvider === "google" && !user.password) {
      res.status(400).json({
        success: false,
        message: "This account was created using Google Sign-In. Please log in with Google.",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    // Set token inside HTTP-only Cookie
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

/**
 * Handle Google OAuth Sign-In & Registration
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ success: false, message: "Google ID Token is required" });
      return;
    }

    const googlePayload = await verifyGoogleToken(idToken);
    const { email, name, picture, sub: googleId } = googlePayload;

    if (!email) {
      res.status(400).json({ success: false, message: "Google account missing email address" });
      return;
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email: email.toLowerCase(),
        googleId,
        authProvider: "google",
        avatar: picture || "",
        isVerified: true,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }

    const token = generateToken(user._id.toString(), user.role);

    // Set token inside HTTP-only Cookie
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Google login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message || "Google authentication failed" });
  }
};

/**
 * Log Out and Clear Authentication Cookie
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("token", {
    ...cookieOptions,
    maxAge: 0, // Immediately expires cookie
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // req.user was securely injected by our 'auth' middleware
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authorized" });
        return;
      }
  
      const user = await User.findById(req.user.id).select("-password"); // Exclude password string for security
      
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
  
      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          authProvider: user.authProvider,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};