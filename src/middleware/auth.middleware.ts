import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

interface JwtPayload {
  id: string;
  role: string;
}

/**
 * auth routes by verifying JWT and optionally checking user roles
 */
export const auth = (...roles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // ১. কুকি থেকে টোকেন রিড করা
      const token = req.cookies?.token;

      if (!token) {
        res.status(401).json({ success: false, message: "Not authorized, please log in" });
        return;
      }

      // ২. টোকেন ভেরিফাই করা
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      // ৩. রোল চেক করা (যদি মিডলওয়্যারে কোনো নির্দিষ্ট রোল পাস করা হয়ে থাকে)
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
        return;
      }

      // ৪. রিকোয়েস্টে ইউজার ডাটা অ্যাসাইন করা
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };

      next();
    } catch (error) {
      res.status(401).json({ success: false, message: "Not authorized, invalid session" });
    }
  };
};