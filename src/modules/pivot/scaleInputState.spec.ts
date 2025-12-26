/**
 * @file Tests for scaleInputState utility
 */
import { describe, it, expect } from "vitest";
import { scaleInputState } from "./scaleInputState";
import type { SwipeInputState } from "../../hooks/gesture/types";

describe("scaleInputState", () => {
  const createSwipingState = (x: number, vx: number): SwipeInputState => ({
    phase: "swiping",
    displacement: { x, y: 0 },
    velocity: { x: vx, y: 0 },
    direction: x > 0 ? 1 : x < 0 ? -1 : 0,
  });

  describe("scaling factor calculation", () => {
    it("scales displacement proportionally (source larger than target)", () => {
      const inputState = createSwipingState(100, 0.5);
      const result = scaleInputState(inputState, 400, 80);

      // 80/400 = 0.2, so 100 * 0.2 = 20
      expect(result.displacement.x).toBe(20);
    });

    it("scales displacement proportionally (source smaller than target)", () => {
      const inputState = createSwipingState(20, 0.1);
      const result = scaleInputState(inputState, 80, 400);

      // 400/80 = 5, so 20 * 5 = 100
      expect(result.displacement.x).toBe(100);
    });

    it("scales velocity proportionally", () => {
      const inputState = createSwipingState(100, 1.0);
      const result = scaleInputState(inputState, 400, 80);

      // 80/400 = 0.2, so 1.0 * 0.2 = 0.2
      expect(result.velocity.x).toBe(0.2);
    });

    it("scales both x and y components", () => {
      const inputState: SwipeInputState = {
        phase: "swiping",
        displacement: { x: 100, y: 50 },
        velocity: { x: 1.0, y: 0.5 },
        direction: 1,
      };
      const result = scaleInputState(inputState, 400, 200);

      // 200/400 = 0.5
      expect(result.displacement.x).toBe(50);
      expect(result.displacement.y).toBe(25);
      expect(result.velocity.x).toBe(0.5);
      expect(result.velocity.y).toBe(0.25);
    });
  });

  describe("same-size containers", () => {
    it("returns identical values when source and target are same size", () => {
      const inputState = createSwipingState(100, 0.5);
      const result = scaleInputState(inputState, 400, 400);

      expect(result.displacement.x).toBe(100);
      expect(result.velocity.x).toBe(0.5);
    });
  });

  describe("idle state handling", () => {
    it("returns unchanged state for idle phase", () => {
      const inputState: SwipeInputState = {
        phase: "idle",
        displacement: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        direction: 0,
      };
      const result = scaleInputState(inputState, 400, 80);

      expect(result).toBe(inputState); // Same reference
    });
  });

  describe("invalid dimension handling", () => {
    it("returns unchanged state when sourceWidth is 0", () => {
      const inputState = createSwipingState(100, 0.5);
      const result = scaleInputState(inputState, 0, 80);

      expect(result).toBe(inputState);
    });

    it("returns unchanged state when targetWidth is 0", () => {
      const inputState = createSwipingState(100, 0.5);
      const result = scaleInputState(inputState, 400, 0);

      expect(result).toBe(inputState);
    });

    it("returns unchanged state when sourceWidth is negative", () => {
      const inputState = createSwipingState(100, 0.5);
      const result = scaleInputState(inputState, -100, 80);

      expect(result).toBe(inputState);
    });

    it("returns unchanged state when targetWidth is negative", () => {
      const inputState = createSwipingState(100, 0.5);
      const result = scaleInputState(inputState, 400, -80);

      expect(result).toBe(inputState);
    });
  });

  describe("phase preservation", () => {
    it("preserves tracking phase", () => {
      const inputState: SwipeInputState = {
        phase: "tracking",
        displacement: { x: 5, y: 0 },
        velocity: { x: 0.1, y: 0 },
        direction: 1,
      };
      const result = scaleInputState(inputState, 400, 80);

      expect(result.phase).toBe("tracking");
    });

    it("preserves swiping phase", () => {
      const inputState = createSwipingState(100, 0.5);
      const result = scaleInputState(inputState, 400, 80);

      expect(result.phase).toBe("swiping");
    });

    it("preserves ended phase", () => {
      const inputState: SwipeInputState = {
        phase: "ended",
        displacement: { x: 150, y: 0 },
        velocity: { x: 0.8, y: 0 },
        direction: 1,
      };
      const result = scaleInputState(inputState, 400, 80);

      expect(result.phase).toBe("ended");
    });
  });

  describe("direction preservation", () => {
    it("preserves positive direction", () => {
      const inputState = createSwipingState(100, 0.5);
      const result = scaleInputState(inputState, 400, 80);

      expect(result.direction).toBe(1);
    });

    it("preserves negative direction", () => {
      const inputState = createSwipingState(-100, -0.5);
      const result = scaleInputState(inputState, 400, 80);

      expect(result.direction).toBe(-1);
    });

    it("preserves zero direction", () => {
      const inputState: SwipeInputState = {
        phase: "swiping",
        displacement: { x: 0, y: 50 },
        velocity: { x: 0, y: 0.5 },
        direction: 0,
      };
      const result = scaleInputState(inputState, 400, 80);

      expect(result.direction).toBe(0);
    });
  });

  describe("negative displacement scaling", () => {
    it("correctly scales negative displacement", () => {
      const inputState = createSwipingState(-100, -0.5);
      const result = scaleInputState(inputState, 400, 80);

      expect(result.displacement.x).toBe(-20);
      expect(result.velocity.x).toBe(-0.1);
    });
  });

  describe("real-world use cases", () => {
    it("synchronizes 5-tab bar with content (content swipe → tabs)", () => {
      // 5 tabs in a 400px content area, each tab is 80px
      const contentWidth = 400;
      const tabWidth = 80;

      // User swipes 200px on content (half the content width)
      const inputState = createSwipingState(200, 1.0);
      const result = scaleInputState(inputState, contentWidth, tabWidth);

      // Tabs should move 40px (half of tab width)
      expect(result.displacement.x).toBe(40);
    });

    it("synchronizes 5-tab bar with content (tabs swipe → content)", () => {
      // Inverse: if swipe started on tabs
      const contentWidth = 400;
      const tabWidth = 80;

      // User swipes 40px on tabs (half the tab width)
      const inputState = createSwipingState(40, 0.2);
      const result = scaleInputState(inputState, tabWidth, contentWidth);

      // Content should move 200px (half of content width)
      expect(result.displacement.x).toBe(200);
    });
  });
});
