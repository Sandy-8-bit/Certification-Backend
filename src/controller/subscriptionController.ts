import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../errors/appError";
import { AuthRequest } from "../middleware/supabaseAuth";

/**
 * POST /course/:courseId/subscribe
 */
export const subscribeToCourse = async (
  req: AuthRequest & { params: { contentId: string } },
  res: Response
) => {
  const { courseId } = req.params;
  const user = req.user;

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  // 1. Course exists check
  const course = await prisma.courses.findUnique({
    where: { id: courseId },
    select: { id: true },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // 2. Prevent duplicate subscription
  const existing = await prisma.subscriptions.findUnique({
    where: {
      user_id_course_id: {
        user_id: user.id,
        course_id: courseId,
      },
    },
  });

  if (existing) {
    throw new AppError("Already subscribed to this course", 409);
  }

  // 3. Count total contents
  const totalContents = await prisma.contents.count({
    where: { course_id: courseId },
  });

  // 4. Transactional create
  const result = await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscriptions.create({
      data: {
        user_id: user.id,
        course_id: courseId,
      },
    });

    await tx.course_completion.create({
      data: {
        subscription_id: subscription.id,
        total_contents: totalContents,
        completed_contents: 0,
        completion_percentage: 0,
        status: "not_started",
      },
    });

    return subscription;
  });

  res.status(201).json({
    message: "Subscribed successfully",
    subscription: result,
  });
};
