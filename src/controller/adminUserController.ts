import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/supabaseAuth";
import { AppError } from "../errors/appError";

const ADMIN_SUPABASE_ID = process.env.ADMIN_UUID!;

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError("Invalid authentication token", 401);
  }

  const { id, email } = req.user;

  let user = await prisma.users.findUnique({
    where: { id },
  });

  if (!user) {
    user = await prisma.users.create({
      data: {
        id,
        email: email ?? "",
        role: id === ADMIN_SUPABASE_ID ? "admin" : "user",
        name: id === ADMIN_SUPABASE_ID ? "admin" : "user",
      },
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};
