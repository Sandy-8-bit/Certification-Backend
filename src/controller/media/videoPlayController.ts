import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/appError";
import { generateReadSas } from "../../services/videoReadSas.service";
import { AuthRequest } from "../../middleware/supabaseAuth";

// GET /media/videos/:contentId/play
export const playVideo = async (
  req: AuthRequest & { params: { contentId: string } },
  res: Response
) => {
  const { contentId } = req.params;
  const user = req.user;

  const ADMIN_SUPABASE_ID = process.env.ADMIN_UUID!;

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  const content = await prisma.contents.findUnique({
    where: { id: contentId },
    include: {
      videos: true,
    },
  });

  if (!content || content.module_type !== "video" || !content.videos) {
    throw new AppError("Video content not found", 404);
  }

  // Admin check
  const isAdmin = user.id === ADMIN_SUPABASE_ID;

  // Admins can always play
  if (!isAdmin) {
    const subscription = await prisma.subscriptions.findFirst({
      where: {
        user_id: user.id,
        course_id: content.course_id,
      },
    });

    if (!subscription) {
      throw new AppError("Access denied to this video", 403);
    }
  }

  const signedUrl = generateReadSas(content.videos.video_url);

  res.status(200).json({
    video_url: signedUrl,
    expires_in: 900, // seconds
  });
};
