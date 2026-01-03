import { Prisma } from "@prisma/client";
import { recomputeCourseCompletion } from "../../utils/recomputeCourseCompletion";

//  Video content
export async function createVideoContent(
  tx: Prisma.TransactionClient,
  courseId: string,
  data: VideoContentInput,
  position: number
) {
  const video = await tx.videos.create({
    data: {
      title: data.video.title,
      description: data.video.description,
      video_url: data.video.video_url,
      thumbnail_url: data.video.thumbnail_url,
      duration: data.video.duration,
    },
  });

  const content = await tx.contents.create({
    data: {
      course_id: courseId,
      tier: data.tier,
      week: data.week,
      day: data.day,
      position,
      tier_name: data.tier_name,
      module_type: "video",
      video_id: video.id,
    },
  });

  await recomputeCourseCompletion(tx, courseId);

  return {
    content,
    video,
  };
}

// quiz content
export async function createTestContent(
  tx: Prisma.TransactionClient,
  courseId: string,
  data: TestContentInput,
  position: number
) {
  const test = await tx.tests.create({
    data: {
      title: data.test.title,
      test_duration: data.test.test_duration,
      quiz_count: data.test.quizzes.length,
    },
  });

  await tx.quizzes.createMany({
    data: data.test.quizzes.map((q) => ({
      test_id: test.id,
      question: q.question,
      choices: q.choices,
      answer: q.answer,
      isMultiChoice: q.isMultiChoice ?? false,
    })),
  });

  const content = await tx.contents.create({
    data: {
      course_id: courseId,
      tier: data.tier,
      week: data.week,
      day: data.day,
      position,
      tier_name: data.tier_name,
      module_type: "test",
      test_id: test.id,
    },
  });

  await recomputeCourseCompletion(tx, courseId);

  return {
    content,
    test,
  };
}
