import { z } from "zod";

export const registerUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long").optional(),
    authProvider: z.enum(["credentials", "google"]).optional(),
    googleId: z.string().optional(),
    avatar: z.string().optional(),
  }).refine((data) => {
    if (data.authProvider === "google" || data.googleId) {
      return true;
    }
    return !!data.password;
  }, {
    message: "Password is required for credentials login",
    path: ["password"],
  });

export const loginUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});