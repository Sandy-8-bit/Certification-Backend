import { Response, Router } from "express";
import { prisma } from "../lib/prisma";
import { supabaseAuth, AuthRequest } from "../middleware/supabaseAuth";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../errors/appError";

const router = Router();

const ADMIN_SUPABASE_ID = process.env.ADMIN_UUID!;

/**
 * Returns current user.
 * Creates user if not exists.
 */
router.get(
  "/me",
  supabaseAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { id, email } = req.user;

    let user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id,
          email: email!,
          role: id === ADMIN_SUPABASE_ID ? "admin" : "user",
          name: id === ADMIN_SUPABASE_ID ? "admin" : "user",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  })
);

export default router;
