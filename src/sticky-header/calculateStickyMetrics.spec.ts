/**
 * @file Tests for calculateStickyMetrics pure function.
 *
 * Verifies the calculation of coverAreaHeight, isStuck, and scrollOffset
 * for both top and bottom positions under various scroll scenarios.
 */
import { calculateStickyMetrics, type ElementRect } from "./calculateStickyMetrics.js";

describe("calculateStickyMetrics", () => {
  describe("position: top", () => {
    it("returns expanded coverAreaHeight during overscroll (pull-down)", () => {
      const rect: ElementRect = { top: 50, bottom: 150, height: 100 };
      const result = calculateStickyMetrics("top", rect, 800);

      expect(result).toEqual({
        coverAreaHeight: 150, // height + top = 100 + 50
        isStuck: false,
        scrollOffset: 0,
      });
    });

    it("returns reduced coverAreaHeight during normal scroll", () => {
      const rect: ElementRect = { top: -30, bottom: 70, height: 100 };
      const result = calculateStickyMetrics("top", rect, 800);

      expect(result).toEqual({
        coverAreaHeight: 70, // height + top = 100 + (-30)
        isStuck: true,
        scrollOffset: 30,
      });
    });

    it("returns exact height at boundary (top === 0)", () => {
      const rect: ElementRect = { top: 0, bottom: 100, height: 100 };
      const result = calculateStickyMetrics("top", rect, 800);

      expect(result).toEqual({
        coverAreaHeight: 100,
        isStuck: false,
        scrollOffset: 0,
      });
    });

    it("clamps coverAreaHeight to 0 when fully scrolled past", () => {
      const rect: ElementRect = { top: -150, bottom: -50, height: 100 };
      const result = calculateStickyMetrics("top", rect, 800);

      expect(result.coverAreaHeight).toBe(0);
      expect(result.isStuck).toBe(true);
      expect(result.scrollOffset).toBe(150);
    });
  });

  describe("position: bottom", () => {
    it("returns expanded coverAreaHeight during overscroll (pull-up)", () => {
      const rect: ElementRect = { top: 600, bottom: 700, height: 100 };
      const viewportHeight = 800;
      const result = calculateStickyMetrics("bottom", rect, viewportHeight);

      // distanceFromBottom = 800 - 700 = 100
      // coverAreaHeight = 100 + 100 = 200
      expect(result).toEqual({
        coverAreaHeight: 200,
        isStuck: false,
        scrollOffset: 0,
      });
    });

    it("returns reduced coverAreaHeight during normal scroll", () => {
      const rect: ElementRect = { top: 750, bottom: 850, height: 100 };
      const viewportHeight = 800;
      const result = calculateStickyMetrics("bottom", rect, viewportHeight);

      // distanceFromBottom = 800 - 850 = -50
      // coverAreaHeight = 100 + (-50) = 50
      expect(result).toEqual({
        coverAreaHeight: 50,
        isStuck: true,
        scrollOffset: 50,
      });
    });

    it("returns exact height at boundary (bottom === viewportHeight)", () => {
      const rect: ElementRect = { top: 700, bottom: 800, height: 100 };
      const viewportHeight = 800;
      const result = calculateStickyMetrics("bottom", rect, viewportHeight);

      expect(result).toEqual({
        coverAreaHeight: 100,
        isStuck: false,
        scrollOffset: 0,
      });
    });

    it("clamps coverAreaHeight to 0 when fully scrolled past", () => {
      const rect: ElementRect = { top: 900, bottom: 1000, height: 100 };
      const viewportHeight = 800;
      const result = calculateStickyMetrics("bottom", rect, viewportHeight);

      expect(result.coverAreaHeight).toBe(0);
      expect(result.isStuck).toBe(true);
      expect(result.scrollOffset).toBe(200);
    });
  });
});
