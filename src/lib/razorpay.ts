import { createHmac, timingSafeEqual } from "node:crypto";

export function razorpayEnabled(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export async function createRazorpayOrder(amountPaise: number, receipt: string): Promise<string> {
  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
  });
  if (!res.ok) throw new Error(`Razorpay order creation failed: ${res.status}`);
  const data = (await res.json()) as { id: string };
  return data.id;
}

function hmacMatches(payload: string, signature: string, secret: string): boolean {
  const expected = Buffer.from(createHmac("sha256", secret).update(payload).digest("hex"));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Signature Razorpay Checkout returns to the browser after a successful payment. */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
  keySecret: string,
): boolean {
  return hmacMatches(`${razorpayOrderId}|${razorpayPaymentId}`, signature, keySecret);
}

/** Signature in the X-Razorpay-Signature header of a webhook, over the raw body. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string,
): boolean {
  return hmacMatches(rawBody, signature, webhookSecret);
}
