import { Prisma } from "@prisma/client";

export async function recomputeCourseCompletion(
  tx: Prisma.TransactionClient,
  courseId: string
) {
  const totalContents = await tx.contents.count({
    where: { course_id: courseId },
  });

  await tx.course_completion.updateMany({
    where: {
      subscriptions: {
        course_id: courseId,
      },
    },
    data: {
      total_contents: totalContents,
    },
  });
}
