import { describe, expect, it } from "vitest";
import { fitWithin } from "@/lib/resize";

describe("fitWithin", () => {
  it("scales the longest side down to the limit, keeping the shape", () => {
    expect(fitWithin(4032, 3024)).toEqual({ width: 2000, height: 1500 });
    expect(fitWithin(3024, 4032)).toEqual({ width: 1500, height: 2000 });
    expect(fitWithin(3000, 3000, 1000)).toEqual({ width: 1000, height: 1000 });
  });

  it("leaves photos that already fit unchanged", () => {
    expect(fitWithin(1200, 800)).toEqual({ width: 1200, height: 800 });
    expect(fitWithin(2000, 1000)).toEqual({ width: 2000, height: 1000 });
  });
});
