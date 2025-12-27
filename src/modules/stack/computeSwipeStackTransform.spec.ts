/**
 * @file Tests for computeSwipeStackTransform pure functions.
 */
import {
  computeActiveTargetPx,
  computeBehindTargetPx,
  computeSwipeProgress,
  computeSwipeVisibility,
  determineSwipePanelRole,
  DEFAULT_BEHIND_OFFSET,
} from "./computeSwipeStackTransform.js";

describe("computeActiveTargetPx", () => {
  it("returns 0 for no displacement", () => {
    expect(computeActiveTargetPx(0)).toBe(0);
  });

  it("returns positive displacement directly", () => {
    expect(computeActiveTargetPx(100)).toBe(100);
    expect(computeActiveTargetPx(250)).toBe(250);
  });

  it("clamps negative displacement to 0", () => {
    expect(computeActiveTargetPx(-50)).toBe(0);
    expect(computeActiveTargetPx(-100)).toBe(0);
  });
});

describe("computeBehindTargetPx", () => {
  const containerSize = 400;

  it("returns base offset position with no displacement", () => {
    const result = computeBehindTargetPx(0, containerSize);
    // Default offset is -0.3, so -0.3 * 400 = -120
    expect(result).toBe(-120);
  });

  it("moves towards 0 as displacement increases", () => {
    // At 50% progress (200px displacement)
    const halfProgress = computeBehindTargetPx(200, containerSize);
    // Should be at -60 (halfway from -120 to 0)
    expect(halfProgress).toBe(-60);

    // At 100% progress (400px displacement)
    const fullProgress = computeBehindTargetPx(400, containerSize);
    // Should be at 0
    expect(fullProgress).toBe(0);
  });

  it("clamps at 0 for large displacement", () => {
    const result = computeBehindTargetPx(800, containerSize);
    expect(result).toBe(0);
  });

  it("handles negative displacement", () => {
    const result = computeBehindTargetPx(-50, containerSize);
    // Negative displacement is treated as 0
    expect(result).toBe(-120);
  });

  it("handles zero container size", () => {
    expect(computeBehindTargetPx(100, 0)).toBe(0);
  });

  it("uses custom behind offset", () => {
    const customOffset = -0.5; // -50%
    const result = computeBehindTargetPx(0, containerSize, customOffset);
    expect(result).toBe(-200); // -0.5 * 400

    // At full progress
    const fullProgress = computeBehindTargetPx(400, containerSize, customOffset);
    expect(fullProgress).toBe(0);
  });
});

describe("computeSwipeProgress", () => {
  const containerSize = 400;

  it("returns 0 for no displacement", () => {
    expect(computeSwipeProgress(0, containerSize)).toBe(0);
  });

  it("returns correct progress for partial swipe", () => {
    expect(computeSwipeProgress(100, containerSize)).toBe(0.25);
    expect(computeSwipeProgress(200, containerSize)).toBe(0.5);
  });

  it("clamps at 1 for full swipe", () => {
    expect(computeSwipeProgress(400, containerSize)).toBe(1);
    expect(computeSwipeProgress(600, containerSize)).toBe(1);
  });

  it("handles negative displacement as 0", () => {
    expect(computeSwipeProgress(-50, containerSize)).toBe(0);
  });

  it("handles zero container size", () => {
    expect(computeSwipeProgress(100, 0)).toBe(0);
  });
});

describe("computeSwipeVisibility", () => {
  it("active panel is always visible", () => {
    expect(
      computeSwipeVisibility({
        depth: 2,
        navigationDepth: 2,
        isActive: true,
        isOperating: false,
        isAnimating: false,
      }),
    ).toBe(true);
  });

  it("behind panel is visible when swiping", () => {
    expect(
      computeSwipeVisibility({
        depth: 1,
        navigationDepth: 2,
        isActive: false,
        isOperating: true,
        isAnimating: false,
      }),
    ).toBe(true);
  });

  it("behind panel is visible when animating", () => {
    expect(
      computeSwipeVisibility({
        depth: 1,
        navigationDepth: 2,
        isActive: false,
        isOperating: false,
        isAnimating: true,
      }),
    ).toBe(true);
  });

  it("behind panel is hidden when idle", () => {
    expect(
      computeSwipeVisibility({
        depth: 1,
        navigationDepth: 2,
        isActive: false,
        isOperating: false,
        isAnimating: false,
      }),
    ).toBe(false);
  });

  it("deeper panels are hidden during swipe", () => {
    expect(
      computeSwipeVisibility({
        depth: 0,
        navigationDepth: 2,
        isActive: false,
        isOperating: true,
        isAnimating: false,
      }),
    ).toBe(false);
  });
});

describe("determineSwipePanelRole", () => {
  it("returns active for current depth", () => {
    expect(determineSwipePanelRole(2, 2)).toBe("active");
  });

  it("returns behind for previous depth", () => {
    expect(determineSwipePanelRole(1, 2)).toBe("behind");
  });

  it("returns hidden for deeper levels", () => {
    expect(determineSwipePanelRole(0, 2)).toBe("hidden");
  });

  it("returns hidden for future levels", () => {
    expect(determineSwipePanelRole(3, 2)).toBe("hidden");
  });
});

describe("DEFAULT_BEHIND_OFFSET", () => {
  it("is -0.3 (30% offset)", () => {
    expect(DEFAULT_BEHIND_OFFSET).toBe(-0.3);
  });
});
