import * as z from "zod";

export type FormState =
  | {
      errors?: Record<string, string[] | undefined>;
      message?: string;
      values?: Record<string, string>;
    }
  | undefined;

const name = z.string().trim().min(2, { error: "Enter your name." }).max(100);
const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address." }));
const contact = z
  .string()
  .trim()
  .regex(/^\d{10}$/, { error: "Enter a 10-digit mobile number, without +91." })
  // Indian mobile numbers start with 6, 7, 8 or 9. Checked only once the length is right.
  .regex(/^(?!\d{10}$)|^[6-9]/, { error: "Mobile numbers start with 6, 7, 8 or 9." });
const city = z.string().trim().min(2, { error: "Enter your city." }).max(100);
const address = z.string().trim().min(5, { error: "Enter your address." }).max(500);
const newPassword = z
  .string()
  .min(8, { error: "Use at least 8 characters." })
  .max(72, { error: "Use at most 72 characters." });

export const SignupSchema = z.object({
  name,
  email,
  password: newPassword,
  contact,
  city,
  address,
});

export const LoginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Enter your password." }),
});

export const ProfileSchema = z.object({ name, contact, city, address });

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, { error: "Enter your current password." }),
  newPassword,
});

export const CheckoutSchema = z.object({
  shipName: name,
  shipContact: contact,
  shipCity: city,
  shipAddress: address,
  paymentMethod: z.enum(["PAY_ON_DELIVERY", "RAZORPAY"]),
});

export const ProductSchema = z.object({
  name: z.string().trim().min(2, { error: "Enter a product name." }).max(150),
  description: z.string().trim().max(5000),
  price: z.string().trim(),
  productType: z.string().trim().max(100),
  tags: z.string().trim().max(300),
});

export function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}

/** Text fields of a form, for refilling it after a failed submit. Never includes passwords. */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string" && !k.toLowerCase().includes("password") && !k.startsWith("$")) {
      values[k] = v;
    }
  }
  return values;
}
