import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../errors/appError";
import { Prisma } from "@prisma/client";
import { recomputeCourseCompletion } from "../utils/recomputeCourseCompletion";
import { uploadFile } from "../services/blob.service";
import { mapTierContents } from "../utils/tierContentMapper";
import { AuthRequest } from "../middleware/supabaseAuth";

// POST /course/tiers/:tierId/contents
export const addTierContent = async (
  req: Request<{ tierId: string }>,
  res: Response
) => {
  const { tierId } = req.params;
  const file = req.file;
  const data = req.body;

  const tier = await prisma.course_tiers.findUnique({
    where: { id: tierId },
    select: { id: true, course_id: true },
  });

  if (!tier) {
    throw new AppError("Tier not found", 404);
  }

  let thumbnail_url = "";

  if (file) {
    const resultUrl = await uploadFile(file, {
      container: "images",
      folder: "thumbnails",
      isPublic: true,
    });

    thumbnail_url = resultUrl;
  }

  const week = Number(data.week);
  const day = Number(data.day);
  const position = data.position ? Number(data.position) : null;

  if (!week || !day) {
    throw new AppError("week and day are required", 400);
  }

  const result = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      let content;

      // VIDEO
      if (data.module_type === "video") {
        const video = await tx.videos.create({
          data: {
            title: data.video.title,
            description: data.video.description,
            video_url: data.video.video_url,
            thumbnail_url: data.video.thumbnail_url,
            duration: Number(data.video.duration),
          },
        });

        content = await tx.contents.create({
          data: {
            course_id: tier.course_id,
            tier_id: tier.id,
            week,
            day,
            position,
            module_type: "video",
            video_id: video.id,
          },
        });
      }

      // TEST
      if (data.module_type === "test") {
        const test = await tx.tests.create({
          data: {
            title: data.test.title,
            test_duration: Number(data.test.test_duration),
            quiz_count: data.test.quizzes.length,
          },
        });

        await tx.quizzes.createMany({
          data: data.test.quizzes.map((q: any) => ({
            test_id: test.id,
            question: q.question,
            choices: q.choices,
            answer: q.answer,
            isMultiChoice: q.isMultiChoice ?? false,
          })),
        });

        content = await tx.contents.create({
          data: {
            course_id: tier.course_id,
            tier_id: tier.id,
            week,
            day,
            position,
            module_type: "test",
            test_id: test.id,
          },
        });
      }

      if (!content) {
        throw new AppError("Invalid module_type", 400);
      }

      await recomputeCourseCompletion(tx, tier.course_id);

      return content;
    }
  );

  res.status(201).json(result);
};

// GET /course/tiers/:tierId/contents
export const getTierContents = async (
  req: AuthRequest & { params: { tierId: string } },
  res: Response
) => {
  const ADMIN_SUPABASE_ID = process.env.ADMIN_UUID!;
  const user = req.user;

  const { tierId } = req.params;

  const tier = await prisma.course_tiers.findUnique({
    where: { id: tierId },
    select: { id: true },
  });

  if (!tier) {
    throw new AppError("Tier not found", 404);
  }

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  // Admin check
  const isAdmin = user.id === ADMIN_SUPABASE_ID;

  // Admins can always access
  if (!isAdmin) {
    const tier = await prisma.course_tiers.findFirst({
      where: {
        id: tierId,
      },
    });

    if (!tier) {
      throw new AppError("Tier not found", 404);
    }

    const subscription = await prisma.subscriptions.findFirst({
      where: {
        user_id: user.id,
        course_id: tier.course_id,
      },
    });

    if (!subscription) {
      throw new AppError("Access denied to this video", 403);
    }
  }

  const contents = await prisma.contents.findMany({
    where: { tier_id: tierId },
    orderBy: [{ week: "asc" }, { day: "asc" }, { position: "asc" }],
    include: {
      videos: true,
      tests: {
        include: {
          quizzes: true,
        },
      },
    },
  });

  const response = mapTierContents(tierId, contents);

  res.status(200).json(response);
};
