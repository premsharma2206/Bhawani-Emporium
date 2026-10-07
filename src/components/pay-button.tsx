"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState } from "react";
import { confirmPayment, startPayment } from "@/actions/orders";

type RazorpayResponse = { razorpay_payment_id: string; razorpay_signature: string };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function PayButton({
  orderId,
  customer,
}: {
  orderId: number;
  customer: { name: string; email: string; contact: string };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);
    const start = await startPayment(orderId);
    if (!start.ok) {
      setError(start.message);
      setBusy(false);
      return;
    }
    if (!window.Razorpay) {
      setError("The payment window could not load. Check your connection and try again.");
      setBusy(false);
      return;
    }
    new window.Razorpay({
      key: start.keyId,
      order_id: start.razorpayOrderId,
      amount: start.amountPaise,
      currency: "INR",
      name: "Bhawani Emporium",
      description: `Order #${orderId}`,
      prefill: customer,
      handler: async (response: RazorpayResponse) => {
        const result = await confirmPayment(
          orderId,
          response.razorpay_payment_id,
          response.razorpay_signature,
        );
        if (!result.ok) setError("We could not confirm the payment. If money was deducted, contact us.");
        setBusy(false);
        router.refresh();
      },
      modal: { ondismiss: () => setBusy(false) },
    }).open();
  }

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button type="button" onClick={pay} disabled={busy} className="btn btn-primary">
        Pay now
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
