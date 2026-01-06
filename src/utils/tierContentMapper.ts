import { contents, videos, tests, quizzes } from "@prisma/client";

type ContentWithRelations = contents & {
  videos?: videos | null;
  tests?: (tests & { quizzes: quizzes[] }) | null;
};

export function mapTierContents(
  tierId: string,
  contents: ContentWithRelations[]
) {
  const weeks: Record<string, Record<string, any[]>> = {};

  for (const item of contents) {
    const weekKey = `week-${item.week}`;
    const dayKey = `day-${item.day}`;

    if (!weeks[weekKey]) {
      weeks[weekKey] = {};
    }

    if (!weeks[weekKey][dayKey]) {
      weeks[weekKey][dayKey] = [];
    }

    // Normalize content shape for frontend
    if (item.module_type === "video" && item.videos) {
      weeks[weekKey][dayKey].push({
        id: item.id,
        module_type: "video",
        position: item.position,
        video: {
          id: item.videos.id,
          title: item.videos.title,
          description: item.videos.description,
          video_url: item.videos.video_url,
          thumbnail_url: item.videos.thumbnail_url,
          duration: item.videos.duration,
          created_at: item.videos.created_at,
        },
      });
    }

    if (item.module_type === "test" && item.tests) {
      weeks[weekKey][dayKey].push({
        id: item.id,
        module_type: "test",
        position: item.position,
        test: {
          id: item.tests.id,
          title: item.tests.title,
          test_duration: item.tests.test_duration,
          quiz_count: item.tests.quiz_count,
          quizzes: item.tests.quizzes.map((q) => ({
            id: q.id,
            question: q.question,
            choices: q.choices,
            answer: q.answer,
            isMultiChoice: q.isMultiChoice,
          })),
        },
      });
    }
  }

  return {
    tierId,
    total: contents.length,
    weeks,
  };
}
