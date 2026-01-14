// controller/webhooks/razorpayWebhookController.ts
import { Request, Response } from "express";
import crypto from "crypto";
import { finalizeSuccessfulPayment } from "../../services/paymentFinalizer.service";

export const razorpayWebhook = async (req: Request, res: Response) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const razorpaySignature = req.headers["x-razorpay-signature"] as string;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(req.body) // raw body buffer
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(req.body.toString());

  // We only care about successful payments
  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;

    const intentId = payment.notes?.payment_intent_id;

    if (intentId) {
      await finalizeSuccessfulPayment(intentId, payment.id);
    }
  }

  res.status(200).json({ received: true });
};
