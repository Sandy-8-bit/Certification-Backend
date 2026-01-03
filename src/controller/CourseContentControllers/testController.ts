import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/appError";

// testController.ts
export const updateTestMetadata = async (
  req: Request<{ testId: string }>,
  res: Response
) => {
  const { testId } = req.params;
  const { title, test_duration } = req.body;

  const test = await prisma.tests.findUnique({
    where: { id: testId },
    select: { id: true },
  });

  if (!test) {
    throw new AppError("Test not found", 404);
  }

  const updated = await prisma.tests.update({
    where: { id: testId },
    data: {
      ...(title && { title }),
      ...(test_duration && { test_duration }),
    },
  });

  res.status(200).json(updated);
};

export const addQuizzesToTest = async (
  req: Request<{ testId: string }>,
  res: Response
) => {
  const { testId } = req.params;
  const { quizzes } = req.body;

  if (!Array.isArray(quizzes) || quizzes.length === 0) {
    throw new AppError("Quizzes array is required", 400);
  }

  const test = await prisma.tests.findUnique({
    where: { id: testId },
    select: { id: true },
  });

  if (!test) {
    throw new AppError("Test not found", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.quizzes.createMany({
      data: quizzes.map((q) => ({
        test_id: testId,
        question: q.question,
        choices: q.choices,
        answer: q.answer,
        isMultiChoice: q.isMultiChoice ?? false,
      })),
    });

    await tx.tests.update({
      where: { id: testId },
      data: {
        quiz_count: {
          increment: quizzes.length,
        },
      },
    });
  });

  res.status(201).json({
    message: "Quizzes added successfully",
    count: quizzes.length,
  });
};
