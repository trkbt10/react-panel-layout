/**
 * @file Tests for dialog animation utilities
 */
import { describe, expect, it } from "vitest";
import {
  computeCloseTransform,
  computeOpenTransform,
  computeSwipeTransform,
  shouldDismiss,
  getAnimationAxis,
  getDirectionSign,
  getCloseDirectionFromSwipe,
  supportsViewTransitions,
  buildTransformString,
} from "./dialogAnimationUtils.js";

describe("dialogAnimationUtils", () => {
  describe("getAnimationAxis", () => {
    it("returns 'y' for center direction", () => {
      expect(getAnimationAxis("center")).toBe("y");
    });

    it("returns 'y' for bottom direction", () => {
      expect(getAnimationAxis("bottom")).toBe("y");
    });

    it("returns 'y' for top direction", () => {
      expect(getAnimationAxis("top")).toBe("y");
    });

    it("returns 'x' for left direction", () => {
      expect(getAnimationAxis("left")).toBe("x");
    });

    it("returns 'x' for right direction", () => {
      expect(getAnimationAxis("right")).toBe("x");
    });
  });

  describe("getDirectionSign", () => {
    it("returns 1 for center (default down)", () => {
      expect(getDirectionSign("center")).toBe(1);
    });

    it("returns 1 for bottom", () => {
      expect(getDirectionSign("bottom")).toBe(1);
    });

    it("returns -1 for top", () => {
      expect(getDirectionSign("top")).toBe(-1);
    });

    it("returns -1 for left", () => {
      expect(getDirectionSign("left")).toBe(-1);
    });

    it("returns 1 for right", () => {
      expect(getDirectionSign("right")).toBe(1);
    });
  });

  describe("computeCloseTransform", () => {
    const containerSize = 800;

    it("returns identity transform at progress 0", () => {
      const result = computeCloseTransform(0, containerSize, "bottom");
      expect(result.translate).toBe(0);
      expect(result.scale).toBe(1);
      expect(result.backdropOpacity).toBe(1);
    });

    it("returns final transform at progress 1", () => {
      const result = computeCloseTransform(1, containerSize, "bottom");
      // 50% of container = 400px translate
      expect(result.translate).toBeCloseTo(400);
      // Final scale is 0.85
      expect(result.scale).toBeCloseTo(0.85);
      // Backdrop should be faded
      expect(result.backdropOpacity).toBe(0);
    });

    it("phase 1 only applies translate", () => {
      const result = computeCloseTransform(0.5, containerSize, "bottom");
      // Still in phase 1 (before 0.7)
      expect(result.scale).toBe(1);
      expect(result.translate).toBeGreaterThan(0);
      expect(result.translate).toBeLessThan(400);
    });

    it("phase 2 applies scale reduction", () => {
      const result = computeCloseTransform(0.85, containerSize, "bottom");
      // In phase 2 (after 0.7)
      expect(result.scale).toBeLessThan(1);
      expect(result.scale).toBeGreaterThan(0.85);
    });

    it("uses negative translate for top direction", () => {
      const result = computeCloseTransform(1, containerSize, "top");
      expect(result.translate).toBeLessThan(0);
    });

    it("uses negative translate for left direction", () => {
      const result = computeCloseTransform(1, containerSize, "left");
      expect(result.translate).toBeLessThan(0);
    });
  });

  describe("computeOpenTransform", () => {
    const containerSize = 800;

    it("returns closed state at progress 0", () => {
      const result = computeOpenTransform(0, containerSize, "bottom");
      expect(result.translate).toBeCloseTo(400);
      expect(result.scale).toBeCloseTo(0.85);
    });

    it("returns identity transform at progress 1", () => {
      const result = computeOpenTransform(1, containerSize, "bottom");
      expect(result.translate).toBe(0);
      expect(result.scale).toBe(1);
    });

    it("is the reverse of computeCloseTransform", () => {
      const closeAt30 = computeCloseTransform(0.3, containerSize, "bottom");
      const openAt70 = computeOpenTransform(0.7, containerSize, "bottom");

      expect(closeAt30.translate).toBeCloseTo(openAt70.translate, 5);
      expect(closeAt30.scale).toBeCloseTo(openAt70.scale, 5);
    });
  });

  describe("computeSwipeTransform", () => {
    const containerSize = 400;

    it("returns identity transform at displacement 0", () => {
      const result = computeSwipeTransform(0, containerSize);
      expect(result.translate).toBe(0);
      expect(result.scale).toBe(1);
      expect(result.backdropOpacity).toBe(1);
    });

    it("translates by displacement amount", () => {
      const result = computeSwipeTransform(100, containerSize);
      expect(result.translate).toBe(100);
    });

    it("applies light scale feedback during swipe", () => {
      const result = computeSwipeTransform(200, containerSize);
      // 50% progress, 2% max reduction = 1% reduction
      expect(result.scale).toBeCloseTo(0.99);
    });

    it("fades backdrop with swipe progress", () => {
      const result = computeSwipeTransform(200, containerSize);
      // 50% progress, 80% max fade = 40% fade
      expect(result.backdropOpacity).toBeCloseTo(0.6);
    });

    it("clamps progress at 1", () => {
      const result = computeSwipeTransform(800, containerSize);
      expect(result.scale).toBeCloseTo(0.98); // Max 2% reduction
      expect(result.backdropOpacity).toBeCloseTo(0.2); // 80% fade
    });
  });

  describe("shouldDismiss", () => {
    const containerSize = 400;

    it("returns true when displacement exceeds threshold", () => {
      // 30% threshold = 120px
      const result = shouldDismiss(130, 0, containerSize);
      expect(result).toBe(true);
    });

    it("returns false when displacement is below threshold", () => {
      const result = shouldDismiss(100, 0, containerSize);
      expect(result).toBe(false);
    });

    it("returns true when velocity is high", () => {
      // 0.5 px/ms threshold
      const result = shouldDismiss(50, 0.6, containerSize);
      expect(result).toBe(true);
    });

    it("returns false when velocity is low", () => {
      const result = shouldDismiss(50, 0.3, containerSize);
      expect(result).toBe(false);
    });

    it("respects custom threshold", () => {
      // Custom 50% threshold = 200px
      const belowThreshold = shouldDismiss(190, 0, containerSize, 0.5);
      const aboveThreshold = shouldDismiss(210, 0, containerSize, 0.5);

      expect(belowThreshold).toBe(false);
      expect(aboveThreshold).toBe(true);
    });
  });

  describe("getCloseDirectionFromSwipe", () => {
    it("returns bottom for positive Y displacement", () => {
      const result = getCloseDirectionFromSwipe(0, 100);
      expect(result).toBe("bottom");
    });

    it("returns top for negative Y displacement", () => {
      const result = getCloseDirectionFromSwipe(0, -100);
      expect(result).toBe("top");
    });

    it("returns right for positive X displacement", () => {
      const result = getCloseDirectionFromSwipe(100, 0);
      expect(result).toBe("right");
    });

    it("returns left for negative X displacement", () => {
      const result = getCloseDirectionFromSwipe(-100, 0);
      expect(result).toBe("left");
    });

    it("prefers Y over X when equal", () => {
      const result = getCloseDirectionFromSwipe(100, 100);
      expect(result).toBe("bottom");
    });

    it("returns default when both are zero", () => {
      const result = getCloseDirectionFromSwipe(0, 0, "left");
      expect(result).toBe("left");
    });
  });

  describe("supportsViewTransitions", () => {
    it("returns a boolean", () => {
      const result = supportsViewTransitions();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("buildTransformString", () => {
    it("builds translateY for y axis", () => {
      const transform = { translate: 100, scale: 0.9, backdropOpacity: 0.5 };
      const result = buildTransformString(transform, "y");
      expect(result).toBe("translateY(100px) scale(0.9)");
    });

    it("builds translateX for x axis", () => {
      const transform = { translate: -50, scale: 1, backdropOpacity: 1 };
      const result = buildTransformString(transform, "x");
      expect(result).toBe("translateX(-50px) scale(1)");
    });
  });
});
