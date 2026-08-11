"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const admin_repository_1 = require("../repositories/admin.repository");
const env_1 = require("../config/env");
const error_middleware_1 = require("../middleware/error.middleware");
class AuthService {
    static async login(data) {
        if (!data.password) {
            throw new error_middleware_1.ApiError(400, "BAD_REQUEST", "Password is required");
        }
        const admin = await admin_repository_1.AdminRepository.findByEmail(data.email);
        if (!admin) {
            throw new error_middleware_1.ApiError(401, "UNAUTHORIZED", "Invalid email or password");
        }
        const isMatch = await bcryptjs_1.default.compare(data.password, admin.passwordHash);
        if (!isMatch) {
            throw new error_middleware_1.ApiError(401, "UNAUTHORIZED", "Invalid email or password");
        }
        const token = jsonwebtoken_1.default.sign({
            sub: admin.id,
            email: admin.email,
            role: admin.role,
        }, env_1.env.JWT_SECRET, {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
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
    static async getMe(adminId) {
        const admin = await admin_repository_1.AdminRepository.findById(adminId);
        if (!admin) {
            throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Admin account not found");
        }
        return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
        };
    }
}
exports.AuthService = AuthService;
