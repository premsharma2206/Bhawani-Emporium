import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyPaymentSignature, verifyWebhookSignature } from "@/lib/razorpay";

const sign = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("hex");

describe("verifyPaymentSignature", () => {
  const secret = "key_secret";
  const signature = sign("order_A|pay_1", secret);

  it("accepts a signature for this order and payment", () => {
    expect(verifyPaymentSignature("order_A", "pay_1", signature, secret)).toBe(true);
  });

  it("rejects a signature made for a different order, payment or secret", () => {
    expect(verifyPaymentSignature("order_B", "pay_1", signature, secret)).toBe(false);
    expect(verifyPaymentSignature("order_A", "pay_2", signature, secret)).toBe(false);
    expect(verifyPaymentSignature("order_A", "pay_1", signature, "other")).toBe(false);
    expect(verifyPaymentSignature("order_A", "pay_1", "", secret)).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  it("accepts only the exact body that was signed", () => {
    const body = '{"event":"payment.captured"}';
    const signature = sign(body, "whsec");
    expect(verifyWebhookSignature(body, signature, "whsec")).toBe(true);
    expect(verifyWebhookSignature(body + " ", signature, "whsec")).toBe(false);
  });
});
