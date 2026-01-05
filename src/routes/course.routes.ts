import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controller/CourseContentControllers/courseController";
import { requireAdmin } from "../middleware/requireAdmin";
import { supabaseAuthJwtDecode } from "../middleware/supabaseAuth";
import { upload } from "../middleware/upload";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management
 */

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_name
 *               - total_hours
 *               - price
 *             properties:
 *               course_name:
 *                 type: string
 *               description:
 *                 type: string
 *               total_hours:
 *                 type: integer
 *               price:
 *                 type: number
 *               thumbnail_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post(
  "/",
  supabaseAuthJwtDecode,
  requireAdmin,
  upload.single("file"),
  asyncHandler(createCourse)
);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get("/", asyncHandler(getAllCourses));

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details
 *       404:
 *         description: Course not found
 */
router.get("/:id", asyncHandler(getCourseById));

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Course updated
 *       403:
 *         description: Admin access required
 */
router.put(
  "/:id",
  supabaseAuthJwtDecode,
  requireAdmin,
  upload.single("file"),
  asyncHandler(updateCourse)
);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Course deleted
 *       403:
 *         description: Admin access required
 */
router.delete(
  "/:id",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(deleteCourse)
);

// contents section

/**
 * @swagger
 * /api/courses/{courseId}/contents:
 *   post:
 *     summary: Add content to a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Content added successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Course not found
 */

// ======================
// Tier section
// ======================

import {
  createTier,
  getCourseTiers,
  updateTier,
  deleteTier,
} from "../controller/CourseContentControllers/tierController";

/**
 * @swagger
 * /api/courses/{courseId}/tiers:
 *   post:
 *     summary: Create a tier for a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tier_number
 *               - tier_name
 *             properties:
 *               tier_number:
 *                 type: integer
 *               tier_name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tier created successfully
 *       409:
 *         description: Tier already exists
 */
router.post(
  "/:courseId/tiers",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(createTier)
);

/**
 * @swagger
 * /api/courses/{courseId}/tiers:
 *   get:
 *     summary: Get all tiers of a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tiers
 */
router.get(
  "/:courseId/tiers",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(getCourseTiers)
);

/**
 * @swagger
 * /api/tiers/{tierId}:
 *   put:
 *     summary: Update tier metadata
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tierId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tier_name:
 *                 type: string
 *               description:
 *                 type: string
 *               tier_number:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tier updated successfully
 */
router.put(
  "/tiers/:tierId",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(updateTier)
);

/**
 * @swagger
 * /api/tiers/{tierId}:
 *   delete:
 *     summary: Delete a tier and its contents
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tierId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tier deleted successfully
 */
router.delete(
  "/tiers/:tierId",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(deleteTier)
);

export default router;
