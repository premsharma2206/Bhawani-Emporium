"use client";

import { useActionState } from "react";
import { placeOrder } from "@/actions/orders";
import { Field, FormMessage, SubmitButton } from "@/components/form";

export function CheckoutForm({
  defaults,
  onlinePayment,
}: {
  defaults: { shipName: string; shipContact: string; shipCity: string; shipAddress: string };
  onlinePayment: boolean;
}) {
  const [state, action] = useActionState(placeOrder, undefined);
  const method = state?.values?.paymentMethod ?? "PAY_ON_DELIVERY";
  return (
    <form action={action} className="space-y-4">
      <Field label="Name" name="shipName" defaultValue={defaults.shipName} state={state} required />
      <Field
        label="Mobile number"
        name="shipContact"
        type="tel"
        defaultValue={defaults.shipContact}
        state={state}
        required
      />
      <Field
        label="Address"
        name="shipAddress"
        textarea
        defaultValue={defaults.shipAddress}
        state={state}
      />
      <Field label="City" name="shipCity" defaultValue={defaults.shipCity} state={state} required />
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Payment</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="paymentMethod"
            value="PAY_ON_DELIVERY"
            defaultChecked={method !== "RAZORPAY"}
          />
          Pay on delivery
        </label>
        {onlinePayment && (
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              value="RAZORPAY"
              defaultChecked={method === "RAZORPAY"}
            />
            Pay online (UPI, cards, net banking)
          </label>
        )}
      </fieldset>
      <FormMessage state={state} />
      <SubmitButton>Place order</SubmitButton>
    </form>
  );
}
