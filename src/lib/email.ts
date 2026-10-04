import nodemailer from "nodemailer";
import { formatPaise } from "@/lib/money";

type OrderForEmail = {
  id: number;
  totalPaise: number;
  paymentMethod: "PAY_ON_DELIVERY" | "RAZORPAY";
  shipName: string;
  shipContact: string;
  shipAddress: string;
  shipCity: string;
  items: { name: string; pricePaise: number; quantity: number }[];
};

async function send(to: string, subject: string, text: string) {
  if (!process.env.SMTP_HOST) {
    console.log(`[email not configured] To: ${to}\nSubject: ${subject}\n\n${text}`);
    return;
  }
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  await transport.sendMail({ from: process.env.EMAIL_FROM, to, subject, text });
}

/** Emails the customer and the shop. A failed email never fails the order. */
export async function sendOrderEmails(order: OrderForEmail, customerEmail: string) {
  const lines = order.items
    .map((i) => `  ${i.quantity} x ${i.name} - ${formatPaise(i.pricePaise * i.quantity)}`)
    .join("\n");
  const payment = order.paymentMethod === "RAZORPAY" ? "Online payment" : "Pay on delivery";
  const body = [
    `Order #${order.id}`,
    "",
    lines,
    "",
    `Total: ${formatPaise(order.totalPaise)}`,
    `Payment: ${payment}`,
    "",
    "Deliver to:",
    `  ${order.shipName}, ${order.shipContact}`,
    `  ${order.shipAddress}, ${order.shipCity}`,
    "",
    `${process.env.APP_URL || ""}/orders/${order.id}`,
  ].join("\n");

  const jobs = [
    send(
      customerEmail,
      `Your Bhawani Emporium order #${order.id}`,
      `Thank you for shopping with us.\n\n${body}`,
    ),
  ];
  if (process.env.SHOP_EMAIL) {
    jobs.push(send(process.env.SHOP_EMAIL, `New order #${order.id}`, `From ${customerEmail}\n\n${body}`));
  }
  for (const result of await Promise.allSettled(jobs)) {
    if (result.status === "rejected") console.error("Order email failed:", result.reason);
  }
}
