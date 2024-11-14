import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken"
import crypto from "crypto"

import clientPromise from "@/lib/dbConnect"
import { TwoFactorToken } from "@/lib/models/auth.model"

export interface IPayload extends JwtPayload {
  email: string
}

export interface IError {
  error: string
}

export const isTokenError = (res: IPayload | IError): res is IError => {
  return (res as IError).error !== undefined
}

export const generateToken = async (payload: { email: string }, expiresIn: string = "1h") => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not defined in environment variables");
    throw new Error("Internal server error");
  }
  
  try {
    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    console.error("Failed to generate token:", error);
    throw new Error("Failed to generate token");
  }
}

export const verifyToken = async (token: string): Promise<IPayload | IError> => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not defined in environment variables");
    return { error: "Internal server error" };
  }

  try {
    const decoded = jwt.verify(token, secret) as IPayload
    return decoded
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return { error: "Token has expired!" }
    } else {
      console.error("Token verification error:", error);
      return { error: "Invalid token!" }
    }
  }
}

export const generateCode = async (email: string) => {
  const token = crypto.randomInt(100000, 1000000).toString() // generate a six-digit random number
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000) // 5 mins

  try {
    const client = await clientPromise;
    const db = client.db();
    const twoFactorTokenCollection = db.collection('twofactortokens');

    await twoFactorTokenCollection.deleteOne({ email });

    await twoFactorTokenCollection.insertOne({
      email,
      token,
      expires
    });

    return token;
  } catch (error) {
    console.error("Failed to generate code:", error);
    throw new Error("Failed to generate code");
  }
}