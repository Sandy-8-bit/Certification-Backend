import type { Response, NextFunction } from "express";
import { AuthRequest } from "./supabaseAuth";
import { prisma } from "../lib/prisma";
import { AppError } from "../errors/appError";
import { asyncHandler } from "../utils/asyncHandler";

export const requireAdmin = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Invalid authentication token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || user.role !== "admin") {
      throw new AppError("Admin access required", 403);
    }

    req.user.role = user.role;

    next();
  }
);
