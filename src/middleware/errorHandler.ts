import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError";
import { Prisma } from "@prisma/client";

export function globalErrorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Operational errors (intentional)
  if (err instanceof AppError && err.isOperational) {
    if (process.env.NODE_ENV !== "production") {
      console.error("OPERATIONAL ERROR :", err);
    }

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let message = "Database error";
    let statusCode = 400;

    if (err.code === "P2002") {
      message = "Duplicate value. Unique constraint failed.";
    } else if (err.code === "P2025") {
      message = "Record not found.";
    }

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Invalid data provided.",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    let statusCode = 401;
    let message = "Invalid token.";
    return res.status(statusCode).json({
      success: false,
      message,
    });
  } else if (err.name === "TokenExpiredError") {
    let statusCode = 401;
    let message = "Token expired. Try Signing again.";
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // Fallback (true bugs / infra issues)
  console.error("UNHANDLED ERROR :", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
