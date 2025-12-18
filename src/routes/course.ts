import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controller/courseController";
import { requireAdmin } from "../middleware/requireAdmin";
import { supabaseAuthJwtDecode } from "../middleware/supabaseAuth";

const router = Router();

router.post(
  "/",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(createCourse)
);
router.get("/", asyncHandler(getAllCourses));
router.get("/:id", asyncHandler(getCourseById));
router.put("/:id", requireAdmin, asyncHandler(updateCourse));
router.delete("/:id", requireAdmin, asyncHandler(deleteCourse));

export default router;
