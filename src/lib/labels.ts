export const ORDER_STATUS_LABEL = {
  PLACED: "Placed",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
} as const;

export const PAYMENT_METHOD_LABEL = {
  PAY_ON_DELIVERY: "Pay on delivery",
  RAZORPAY: "Online payment",
} as const;

export const PAYMENT_STATUS_LABEL = { UNPAID: "Not paid", PAID: "Paid" } as const;

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export function formatDate(date: Date) {
  return dateFormat.format(date);
}
