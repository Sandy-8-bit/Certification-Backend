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
import {
  addCourseContent,
  getCourseContents,
} from "../controller/CourseContentControllers/contentController";

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
router.post(
  "/:courseId/contents",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(addCourseContent)
);

router.get(
  "/:courseId/contents",
  supabaseAuthJwtDecode,
  requireAdmin,
  asyncHandler(getCourseContents)
);

export default router;
