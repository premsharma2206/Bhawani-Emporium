import { describe, expect, it } from "vitest";
import { cartTotalPaise, paiseToRupees, rupeesToPaise } from "@/lib/money";

describe("rupeesToPaise", () => {
  it("parses whole and decimal rupee amounts", () => {
    expect(rupeesToPaise("499")).toBe(49900);
    expect(rupeesToPaise("499.5")).toBe(49950);
    expect(rupeesToPaise(" 0.05 ")).toBe(5);
    expect(rupeesToPaise("1999.99")).toBe(199999);
  });

  it("rejects anything that is not a plain amount", () => {
    for (const bad of ["", "abc", "-5", "1.234", "1e3", "12,000", "1; DROP TABLE"]) {
      expect(rupeesToPaise(bad)).toBeNull();
    }
  });
});

describe("paiseToRupees", () => {
  it("round-trips through rupeesToPaise", () => {
    for (const paise of [49900, 49950, 5, 199999]) {
      expect(rupeesToPaise(paiseToRupees(paise))).toBe(paise);
    }
  });
});

describe("cartTotalPaise", () => {
  it("multiplies price by quantity and sums", () => {
    expect(
      cartTotalPaise([
        { quantity: 2, product: { pricePaise: 49900 } },
        { quantity: 1, product: { pricePaise: 150 } },
      ]),
    ).toBe(99950);
    expect(cartTotalPaise([])).toBe(0);
  });
});
