import type { NextFunction, Request, Response } from "express";
import type { IUser } from "../model/user.js";
import jwt, { decode, type JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login - No auth header",
      });
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login - No token provided",
      });
    }

    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    if (!decodedValue || !decodedValue.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = decodedValue.user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Please login - JWT error",
    });
  }
};
