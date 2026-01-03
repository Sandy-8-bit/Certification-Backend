import { Router } from "express";
import { supabaseAuthJwtDecode } from "../middleware/supabaseAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import { asyncHandler } from "../utils/asyncHandler";
import {
  addQuizzesToTest,
  updateTestMetadata,
} from "../controller/CourseContentControllers/testController";

const router = Router();

router.put(
  "/:testId",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(updateTestMetadata)
);

router.post(
  "/:testId/quizzes",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(addQuizzesToTest)
);
