import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminRepository } from "../repositories/admin.repository";
import { env } from "../config/env";
import { ApiError } from "../middleware/error.middleware";

export class AuthService {
  static async login(data: { email: string; password?: string }) {
    if (!data.password) {
      throw new ApiError(400, "BAD_REQUEST", "Password is required");
    }

    const admin = await AdminRepository.findByEmail(data.email);
    if (!admin) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(data.password, admin.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid email or password");
    }

    const token = jwt.sign(
      {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
      },
      env.JWT_SECRET,
      {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        expiresIn: env.JWT_EXPIRES_IN as any,
      }
    );

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  static async getMe(adminId: string) {
    const admin = await AdminRepository.findById(adminId);
    if (!admin) {
      throw new ApiError(404, "NOT_FOUND", "Admin account not found");
    }
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  }
}
