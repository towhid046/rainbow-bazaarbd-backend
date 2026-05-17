import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {User} from "../models/User.model";

// Define RequestHandler type to match Express middleware signature
const verifyAdmin = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const user = await User.findOne({email: decoded.email})
    if(!user){
      res.status(404).json({ message: "User not found!" });
      return;
    }
    
    if (user?.role !== "admin") {
      res.status(403).json({ message: "Authorization Failed!" });
      return;
    }
    next();
  } catch (error) {
    next('"Invalid or expired token"')
  }
};

export default verifyAdmin;
