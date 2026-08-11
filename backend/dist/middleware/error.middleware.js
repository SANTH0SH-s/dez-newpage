"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    code;
    constructor(statusCode, code, message) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
exports.ApiError = ApiError;
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || "INTERNAL_SERVER_ERROR";
    const errorMessage = statusCode === 500 && process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message;
    if (statusCode === 500) {
        console.error("💥 Server Error:", err);
    }
    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message: errorMessage,
        },
    });
};
exports.errorHandler = errorHandler;
