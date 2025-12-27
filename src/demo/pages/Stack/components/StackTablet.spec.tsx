/**
 * @file Tests for StackTablet component logic.
 *
 * These tests focus on the panel visibility and depth calculation logic,
 * particularly around the exitingPanelId handling during rapid navigation.
 */
import { describe, it, expect } from "vitest";

/**
 * Pure function version of the isExiting logic for testing.
 * This matches the logic in StackTablet.tsx.
 */
function computeIsExiting(
  panelId: string,
  exitingPanelId: string | null,
  stack: readonly string[],
): boolean {
  // FIX: Check if panel is in current stack - if so, it's not exiting
  const isInCurrentStack = stack.includes(panelId);
  return panelId === exitingPanelId && !isInCurrentStack;
}

/**
 * Pure function version of panelDepth calculation.
 */
function computePanelDepth(
  panelId: string,
  isExiting: boolean,
  stack: readonly string[],
  depth: number,
): number {
  return isExiting ? depth + 1 : stack.indexOf(panelId);
}

describe("StackTablet panel calculation logic", () => {
  describe("isExiting calculation", () => {
    it("returns false when panel is in current stack even if it matches exitingPanelId", () => {
      // Bug scenario: user pushed panel again before exitingPanelId timeout cleared
      const result = computeIsExiting("general", "general", ["root", "general"]);
      expect(result).toBe(false);
    });
  });

  describe("panelDepth calculation", () => {
    it("returns correct depth for re-pushed panel (not exiting)", () => {
      // Bug scenario: general was exiting but got re-pushed
      const stack = ["root", "general"];
      const isExiting = computeIsExiting("general", "general", stack);
      const depth = computePanelDepth("general", isExiting, stack, 1);
      expect(depth).toBe(1); // stack.indexOf("general") = 1, NOT depth + 1 = 2
    });
  });

  describe("rapid navigation scenarios", () => {
    it("handles push → back → push sequence correctly", () => {
      // Initial: root active
      let stack: readonly string[] = ["root"];
      let depth = 0;
      let exitingPanelId: string | null = null;

      // Push general
      stack = ["root", "general"];
      depth = 1;

      // Back to root (general becomes exiting)
      stack = ["root"];
      depth = 0;
      exitingPanelId = "general";

      // Push general again BEFORE exitingPanelId clears
      stack = ["root", "general"];
      depth = 1;
      // exitingPanelId is still "general" (timeout hasn't fired yet)

      // Now general should NOT be exiting because it's in the stack
      const isExiting = computeIsExiting("general", exitingPanelId, stack);
      expect(isExiting).toBe(false);

      // Panel depth should be correct
      const panelDepth = computePanelDepth("general", isExiting, stack, depth);
      expect(panelDepth).toBe(1); // Not 2!
    });

    it("handles Settings menu rapid navigation", () => {
      // Simulating actual Settings menu navigation
      let stack: readonly string[] = ["root"];
      let depth = 0;
      let exitingPanelId: string | null = null;

      // Click "General"
      stack = ["root", "general"];
      depth = 1;

      // Click "About"
      stack = ["root", "general", "about"];
      depth = 2;

      // Back to General
      stack = ["root", "general"];
      depth = 1;
      exitingPanelId = "about";

      // Immediately back to root
      stack = ["root"];
      depth = 0;
      exitingPanelId = "general";

      // Immediately push General again
      stack = ["root", "general"];
      depth = 1;

      // general should NOT be exiting
      const isExiting = computeIsExiting("general", exitingPanelId, stack);
      expect(isExiting).toBe(false);

      const panelDepth = computePanelDepth("general", isExiting, stack, depth);
      expect(panelDepth).toBe(1);
    });
  });
});
