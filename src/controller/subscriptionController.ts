import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../errors/appError";
import { AuthRequest } from "../middleware/supabaseAuth";
import razorpay from "../services/razorpay.service";
import crypto from "crypto";

/**
 * POST /course/:courseId/subscribe
 */

export const subscribeToCourse = async (
  req: AuthRequest & { params: { courseId: string } },
  res: Response
) => {
  const { courseId } = req.params;
  const user = req.user;

  if (!user) throw new AppError("Unauthorized", 401);

  const course = await prisma.courses.findUnique({
    where: { id: courseId },
  });
  if (!course) throw new AppError("Course not found", 404);

  // Prevent duplicate subscription
  const existing = await prisma.subscriptions.findUnique({
    where: {
      user_id_course_id: {
        user_id: user.id,
        course_id: courseId,
      },
    },
  });
  if (existing) {
    throw new AppError("Already subscribed to this course", 409);
  }

  // 1️⃣ Create payment intent
  const intent = await prisma.payment_intents.create({
    data: {
      user_id: user.id,
      course_id: courseId,
      amount: course.price,
      currency: "INR",
      status: "created",
    },
  });

  // 2️⃣ Create Razorpay order
  const order = await razorpay.orders.create({
    amount: Number(course.price) * 100,
    currency: "INR",
    receipt: `receipt_${intent.id}`,
    notes: {
      payment_intent_id: intent.id,
    },
  });

  // 3️⃣ Store Razorpay order id
  await prisma.payment_intents.update({
    where: { id: intent.id },
    data: {
      razorpay_order_id: order.id,
    },
  });

  res.status(201).json({
    message: "Order created",
    order,
  });
};

/**
 * POST /course/subscribe/verify
 */
export const verifySubscriptionPayment = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user;
  if (!user) throw new AppError("Unauthorized", 401);

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError("Missing payment details", 400);
  }

  // 1️ Verify signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new AppError("Invalid payment signature", 400);
  }

  const order = await razorpay.orders.fetch(razorpay_order_id);
  if (order.status !== "paid") {
    throw new AppError("Payment not completed", 400);
  }

  const intentId = order.notes!.payment_intent_id;

  if (!intentId) {
    throw new AppError("Payment intent not found", 400);
  }

  const intent = await prisma.payment_intents.findUnique({
    where: { id: intentId.toString() },
  });

  if (!intent || intent.status === "paid") {
    throw new AppError("Invalid or already processed payment", 400);
  }

  // 3️ Count contents
  const totalContents = await prisma.contents.count({
    where: { course_id: intent.course_id },
  });

  // 4️ Transaction: grant access
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
        razorpay_payment_id,
      },
    });
  });

  res.json({
    success: true,
    message: "Payment verified and subscription activated",
  });
};
