import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const errorHandler = (
  err: Error & { statusCode?: number; code?: string },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') || "Invalid request data",
      },
    });
    return;
  }
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
