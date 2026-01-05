// import { prisma } from "../lib/prisma";

// export async function getNextPosition(
//   courseId: string,
//   tier: number,
//   week: number,
//   day: number
// ) {
//   const last = await prisma.contents.findFirst({
//     where: { course_id: courseId, tier, week, day },
//     orderBy: { position: "desc" },
//     select: { position: true },
//   });

//   return last ? (last.position || 0) + 1 : 1;
// }
