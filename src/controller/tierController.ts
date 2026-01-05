import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../errors/appError";

/**
 * CREATE TIER
 * POST /api/courses/:courseId/tiers
 */
export const createTier = async (
  req: Request<{ courseId: string }>,
  res: Response
) => {
  const { courseId } = req.params;
  const { tier_number, tier_name, description } = req.body;

  if (!tier_number || !tier_name) {
    throw new AppError("tier_number and tier_name are required", 400);
  }

  const tierNumber = Number(tier_number);

  if (!Number.isInteger(tierNumber) || tierNumber < 1) {
    throw new AppError("tier_number must be a positive integer", 400);
  }

  // Ensure course exists
  const course = await prisma.courses.findUnique({
    where: { id: courseId },
    select: { id: true },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Prevent duplicate tier numbers
  const existingTier = await prisma.course_tiers.findFirst({
    where: {
      course_id: courseId,
      tier_number: tierNumber,
    },
  });

  if (existingTier) {
    throw new AppError(
      "Tier already exists with this tier number for this course",
      409
    );
  }

  const tier = await prisma.course_tiers.create({
    data: {
      course_id: courseId,
      tier_number: tierNumber,
      tier_name,
      description,
    },
  });

  res.status(201).json(tier);
};

/**
 * GET TIERS BY COURSE
 * GET /api/courses/:courseId/tiers
 */
export const getCourseTiers = async (
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

  const tiers = await prisma.course_tiers.findMany({
    where: {
      course_id: courseId,
    },
    orderBy: {
      tier_number: "asc",
    },
  });

  res.status(200).json({
    courseId,
    total: tiers.length,
    tiers,
  });
};

/**
 * UPDATE TIER
 * PUT /api/tiers/:tierId
 */
export const updateTier = async (
  req: Request<{ tierId: string }>,
  res: Response
) => {
  const { tierId } = req.params;
  const { tier_name, description, tier_number } = req.body;

  const tierNumber = Number(tier_number);

  if (!Number.isInteger(tierNumber) || tierNumber < 1) {
    throw new AppError("tier_number must be a positive integer", 400);
  }

  const tier = await prisma.course_tiers.findUnique({
    where: { id: tierId },
    select: { id: true, course_id: true },
  });

  if (!tier) {
    throw new AppError("Tier not found", 404);
  }

  // If tier_number is being updated, ensure uniqueness
  if (tierNumber) {
    const conflict = await prisma.course_tiers.findFirst({
      where: {
        course_id: tier.course_id,
        tier_number: tierNumber,
        NOT: { id: tierId },
      },
    });

    if (conflict) {
      throw new AppError("Another tier already uses this tier_number", 409);
    }
  }

  const updatedTier = await prisma.course_tiers.update({
    where: { id: tierId },
    data: {
      ...(tier_name && { tier_name }),
      ...(description !== undefined && { description }),
      ...(tierNumber && { tier_number: tierNumber }),
    },
  });

  res.status(200).json(updatedTier);
};

/**
 * DELETE TIER
 * DELETE /api/tiers/:tierId
 */
export const deleteTier = async (
  req: Request<{ tierId: string }>,
  res: Response
) => {
  const { tierId } = req.params;

  const tier = await prisma.course_tiers.findUnique({
    where: { id: tierId },
    select: { id: true },
  });

  if (!tier) {
    throw new AppError("Tier not found", 404);
  }

  await prisma.course_tiers.delete({
    where: { id: tierId },
  });

  res.status(200).json({
    message: "Tier deleted successfully",
  });
};
