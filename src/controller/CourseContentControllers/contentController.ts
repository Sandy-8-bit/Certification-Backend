import { Request, Response } from "express";
import { AppError } from "../../errors/appError";
import { prisma } from "../../lib/prisma";
import { getNextPosition } from "../../utils/getNextPosition";
import { createTestContent, createVideoContent } from "./video&QuizController";
import { nestCourseContents } from "../../utils/CourseContentMapper";

// Course Content Creation
export const addCourseContent = async (
  req: Request<{ courseId: string }, {}, CreateContentInput>,
  res: Response
) => {
  const { courseId } = req.params;
  const data = req.body;

  // 1. course exists check
  const course = await prisma.courses.findUnique({
    where: { id: courseId },
    select: { id: true },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // 2. basic validation
  if (data.tier < 1 || data.week < 1 || data.day < 1) {
    throw new AppError("Invalid tier, week or day", 400);
  }

  // 3. resolve position (auto if missing)
  const position =
    data.position ??
    (await getNextPosition(courseId, data.tier, data.week, data.day));

  // 4. position collision guard
  const collision = await prisma.contents.findFirst({
    where: {
      course_id: courseId,
      tier: data.tier,
      week: data.week,
      day: data.day,
      position,
    },
  });

  if (collision) {
    throw new AppError(
      "Content already exists at this position for the same day",
      409
    );
  }

  // 5. transactional write
  const result = await prisma.$transaction(async (tx) => {
    if (data.module_type === "video") {
      return createVideoContent(tx, courseId, data, position);
    }

    if (data.module_type === "test") {
      return createTestContent(tx, courseId, data, position);
    }

    throw new AppError("Invalid module type", 400);
  });

  res.status(201).json(result);
};

// Get Course content
export const getCourseContents = async (
  req: Request<{ courseId: string }>,
  res: Response
) => {
  const { courseId } = req.params;

  const course = await prisma.courses.findUnique({
    where: { id: courseId },
    select: { id: true },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const contents = await prisma.contents.findMany({
    where: { course_id: courseId },
    orderBy: [
      { tier: "asc" },
      { week: "asc" },
      { day: "asc" },
      { position: "asc" },
    ],
    include: {
      videos: true,
      tests: {
        include: {
          quizzes: true,
        },
      },
    },
  });

  const nestedContents = nestCourseContents(contents);

  res.status(200).json({
    courseId,
    total: contents.length,
    contents: nestedContents,
  });
};
