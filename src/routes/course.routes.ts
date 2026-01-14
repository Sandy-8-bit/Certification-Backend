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
import { upload } from "../middleware/upload";

const router = Router();

/**
 * ======================
 * Course section
 * ======================
 */

router.post(
  "/",
  supabaseAuthJwtDecode,
  requireAdmin,
  upload.single("file"),
  asyncHandler(createCourse)
);

router.get("/", asyncHandler(getAllCourses));

router.get("/:id", asyncHandler(getCourseById));

router.patch(
  "/:id",
  supabaseAuthJwtDecode,
  requireAdmin,
  upload.single("file"),
  asyncHandler(updateCourse)
);

router.delete(
  "/:id",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(deleteCourse)
);

/**
 * ======================
 * Subscription section to that course
 * ======================
 */

router.post(
  "/:courseId/subscribe",
  supabaseAuthJwtDecode,
  asyncHandler(subscribeToCourse)
);

router.post(
  "/subscribe/verify",
  supabaseAuthJwtDecode,
  asyncHandler(verifySubscriptionPayment)
);

/**
 * ======================
 * Tier section
 * ======================
 */

import {
  createTier,
  getCourseTiers,
  updateTier,
  deleteTier,
} from "../controller/tierController";

router.get(
  "/:courseId/tiers",
  supabaseAuthJwtDecode,
  asyncHandler(getCourseTiers)
);

router.post(
  "/:courseId/tiers",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(createTier)
);

router.put(
  "/tiers/:tierId",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(updateTier)
);

router.delete(
  "/tiers/:tierId",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(deleteTier)
);

/**
 * ======================
 * Content section
 * ======================
 */

import {
  addTierContent,
  getTierContents,
} from "../controller/contentController";
import {
  subscribeToCourse,
  verifySubscriptionPayment,
} from "../controller/subscriptionController";

router.post(
  "/tiers/:tierId/contents",
  supabaseAuthJwtDecode,
  requireAdmin,
  upload.single("file"),
  asyncHandler(addTierContent)
);

router.get(
  "/tiers/:tierId/contents",
  supabaseAuthJwtDecode,
  asyncHandler(getTierContents)
);

export default router;
