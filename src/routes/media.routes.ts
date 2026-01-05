import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { supabaseAuthJwtDecode } from "../middleware/supabaseAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import { generateVideoUploadUrl } from "../controller/media/videoUploadController";
import { playVideo } from "../controller/media/videoPlayController";

const router = Router();

router.post(
  "/videos/upload-url",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(generateVideoUploadUrl)
);

router.get(
  "/videos/:contentId/play",
  supabaseAuthJwtDecode,
  asyncHandler(playVideo)
);

export default router;
