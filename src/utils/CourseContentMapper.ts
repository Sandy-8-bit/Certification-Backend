export function nestCourseContents(contents: any[]) {
  const nested: any = {};

  for (const item of contents) {
    const tierKey = item.tier_name ?? `Tier-${item.tier}`;
    const weekKey = `week-${item.week}`;
    const dayKey = `day-${item.day}`;

    if (!nested[tierKey]) {
      nested[tierKey] = {};
    }

    if (!nested[tierKey][weekKey]) {
      nested[tierKey][weekKey] = {};
    }

    if (!nested[tierKey][weekKey][dayKey]) {
      nested[tierKey][weekKey][dayKey] = [];
    }

    // Normalize content payload
    let contentPayload;

    if (item.module_type === "video" && item.videos) {
      contentPayload = {
        id: item.videos.id,
        module_type: "video",
        title: item.videos.title,
        description: item.videos.description,
        video_url: item.videos.video_url,
        thumbnail_url: item.videos.thumbnail_url,
        duration: item.videos.duration,
        created_at: item.videos.created_at,
        position: item.position,
      };
    }

    if (item.module_type === "test" && item.tests) {
      contentPayload = {
        id: item.tests.id,
        module_type: "test",
        title: item.tests.title,
        test_duration: item.tests.test_duration,
        quizzes: item.tests.quizzes,
        position: item.position,
      };
    }

    nested[tierKey][weekKey][dayKey].push(contentPayload);
  }

  // Ensure position ordering inside each day
  for (const tier of Object.values(nested) as any[]) {
    for (const week of Object.values(tier) as any[]) {
      for (const day of Object.values(week) as any[]) {
        day.sort((a: any, b: any) => a.position - b.position);
      }
    }
  }

  return nested;
}
