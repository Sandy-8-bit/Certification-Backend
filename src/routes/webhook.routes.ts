import { Router } from "express";
import { razorpayWebhook } from "../controller/webhooks/razorpayWebhookController";

const router = Router();

router.post("/razorpay", razorpayWebhook);

export default router;
