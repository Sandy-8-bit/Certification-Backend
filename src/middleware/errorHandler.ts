import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError";
import { Prisma } from "@prisma/client";

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let message = "Internal server error";

  // Custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  // Prisma known errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;

    if (err.code === "P2002") {
      message = "Duplicate value. Unique constraint failed.";
    } else if (err.code === "P2025") {
      message = "Record not found.";
    } else {
      message = "Database error.";
    }
  }

  // Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided.";
  }

  // JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired.";
  }

  // Log only in non production
  if (process.env.NODE_ENV !== "production") {
    console.error("ERROR 💥", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}
