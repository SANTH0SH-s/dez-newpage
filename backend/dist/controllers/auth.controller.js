"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const admin_schemas_1 = require("../utils/admin.schemas");
const serialization_1 = require("../utils/serialization");
class AuthController {
    static async login(req, res, next) {
        try {
            const validated = admin_schemas_1.loginSchema.parse(req.body);
            const result = await auth_service_1.AuthService.login(validated);
            // Set cookie
            res.cookie("token", result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
            });
            res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(result.admin),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async me(req, res, next) {
        try {
            if (!req.admin) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
                return;
            }
            const admin = await auth_service_1.AuthService.getMe(req.admin.id);
            res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(admin),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
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
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
