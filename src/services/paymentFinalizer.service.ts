// services/paymentFinalizer.ts
import { prisma } from "../lib/prisma";

export async function finalizeSuccessfulPayment(
  intentId: string,
  razorpayPaymentId: string
) {
  const intent = await prisma.payment_intents.findUnique({
    where: { id: intentId },
  });

  // idempotency guard
  if (!intent || intent.status === "paid") return;

  const totalContents = await prisma.contents.count({
    where: { course_id: intent.course_id },
  });

  await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscriptions.create({
      data: {
        user_id: intent.user_id,
        course_id: intent.course_id,
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

    await tx.payment_intents.update({
      where: { id: intent.id },
      data: {
        status: "paid",
        razorpay_payment_id: razorpayPaymentId,
      },
    });
  });
}
