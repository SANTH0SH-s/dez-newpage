/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { loginSchema } from "../utils/admin.schemas";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { serializeData } from "../utils/serialization";

export class AuthController {
  static async login(req: any, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated);

      // Set cookie
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.status(200).json({
        success: true,
        data: serializeData(result.admin),
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.admin) {
        res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
        return;
      }
      const admin = await AuthService.getMe(req.admin.id);
      res.status(200).json({
        success: true,
        data: serializeData(admin),
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.status(200).json({
        success: true,
        data: { message: "Logged out successfully" },
      });
    } catch (error) {
      next(error);
    }
  }
}
