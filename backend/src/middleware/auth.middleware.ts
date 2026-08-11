import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "./error.middleware";

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.cookies?.token;

    // Fallback to Authorization Header
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication token is missing");
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      
      if (decoded.role !== "ADMIN") {
        throw new ApiError(403, "FORBIDDEN", "Forbidden: Admin access required");
      }

      req.admin = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
      
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, "UNAUTHORIZED", "Token has expired");
      }
      throw new ApiError(401, "UNAUTHORIZED", "Invalid token signature or payload");
    }
  } catch (error) {
    next(error);
  }
};
