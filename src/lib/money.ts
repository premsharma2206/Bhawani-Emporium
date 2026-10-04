const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPaise(paise: number): string {
  return inr.format(paise / 100);
}

/** Parses a rupee amount such as "499" or "499.50". Returns null if invalid. */
export function rupeesToPaise(input: string): number | null {
  const match = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(input.trim());
  if (!match) return null;
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

export function paiseToRupees(paise: number): string {
  return paise % 100 === 0 ? String(paise / 100) : (paise / 100).toFixed(2);
}

export function cartTotalPaise(
  items: { quantity: number; product: { pricePaise: number } }[],
): number {
  return items.reduce((sum, i) => sum + i.quantity * i.product.pricePaise, 0);
}
