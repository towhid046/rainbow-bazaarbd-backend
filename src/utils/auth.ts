import jwt, { SignOptions } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generates a standard JWT for your authenticated users
 */
export const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET as string,
    { 
      // Casting this explicitly satisfies TypeScript's strict signature rules
      expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"] 
    }
  );
};

/**
 * Verifies a Google ID Token sent from the frontend
 */
export const verifyGoogleToken = async (idToken: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid Google token payload");
    }
    
    // Returns google user info: email, name, picture, sub (googleId)
    return payload;
  } catch (error) {
    throw new Error("Google token verification failed");
  }
};