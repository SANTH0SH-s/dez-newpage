"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const error_middleware_1 = require("./error.middleware");
const authMiddleware = (req, res, next) => {
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
            throw new error_middleware_1.ApiError(401, "UNAUTHORIZED", "Authentication token is missing");
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            if (decoded.role !== "ADMIN") {
                throw new error_middleware_1.ApiError(403, "FORBIDDEN", "Forbidden: Admin access required");
            }
            req.admin = {
                id: decoded.sub,
                email: decoded.email,
                role: decoded.role,
            };
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new error_middleware_1.ApiError(401, "UNAUTHORIZED", "Token has expired");
            }
            throw new error_middleware_1.ApiError(401, "UNAUTHORIZED", "Invalid token signature or payload");
        }
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
