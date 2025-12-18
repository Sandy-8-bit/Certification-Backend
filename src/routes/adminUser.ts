import { Router } from "express";
import { prisma } from "../lib/prisma";
import { supabaseAuth, AuthRequest } from "../middleware/supabaseAuth";


const router = Router();

const ADMIN_SUPABASE_ID = "PASTE_ADMIN_UUID_HERE";

router.get("/me", supabaseAuth, async (req: AuthRequest, res) => {
  const authUser = req.user!;

  let user = await prisma.user.findUnique({
    where: { id: authUser.id }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email!,
        role:
          authUser.id === ADMIN_SUPABASE_ID
            ? "admin"
            : "user"
      }
    });
  }

  res.json(user);
});

export default router;
