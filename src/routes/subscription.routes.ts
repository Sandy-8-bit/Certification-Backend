import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { supabaseAuthJwtDecode } from "../middleware/supabaseAuth";
import { subscribeToCourse } from "../controller/subscriptionController";

const router = Router();

router.post(
  "/course/:courseId/subscribe",
  supabaseAuthJwtDecode,
  asyncHandler(subscribeToCourse)
);

export default router;
