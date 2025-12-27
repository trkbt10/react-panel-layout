/**
 * @file Tests for StackBasics component logic.
 *
 * These tests focus on the panel visibility and depth calculation logic,
 * particularly around the exitingPanelId handling during rapid navigation.
 */
import { describe, it, expect } from "vitest";

/**
 * Pure function version of the isExiting logic for testing.
 * This matches the logic in StackBasics.tsx.
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

describe("StackBasics panel calculation logic", () => {
  describe("isExiting calculation", () => {
    it("returns true when panel is exitingPanelId and not in stack", () => {
      // Back navigation: detail was removed from stack but exitingPanelId is set
      const result = computeIsExiting("detail", "detail", ["list"]);
      expect(result).toBe(true);
    });

    it("returns false when panel is in current stack even if it matches exitingPanelId", () => {
      // Bug scenario: user pushed detail again before exitingPanelId timeout cleared
      // detail is in stack but exitingPanelId is still "detail"
      const result = computeIsExiting("detail", "detail", ["list", "detail"]);
      expect(result).toBe(false);
    });

    it("returns false when panel does not match exitingPanelId", () => {
      const result = computeIsExiting("list", "detail", ["list"]);
      expect(result).toBe(false);
    });

    it("returns false when exitingPanelId is null", () => {
      const result = computeIsExiting("detail", null, ["list", "detail"]);
      expect(result).toBe(false);
    });
  });

  describe("panelDepth calculation", () => {
    it("returns correct depth for active panel in stack", () => {
      const isExiting = computeIsExiting("detail", null, ["list", "detail"]);
      const depth = computePanelDepth("detail", isExiting, ["list", "detail"], 1);
      expect(depth).toBe(1);
    });

    it("returns depth + 1 for exiting panel", () => {
      const isExiting = computeIsExiting("detail", "detail", ["list"]);
      const depth = computePanelDepth("detail", isExiting, ["list"], 0);
      expect(depth).toBe(1); // 0 + 1
    });

    it("returns correct depth for re-pushed panel (not exiting)", () => {
      // Bug scenario: detail was exiting but got re-pushed
      // Should use stack.indexOf, not depth + 1
      const stack = ["list", "detail"];
      const isExiting = computeIsExiting("detail", "detail", stack);
      const depth = computePanelDepth("detail", isExiting, stack, 1);
      expect(depth).toBe(1); // stack.indexOf("detail") = 1, NOT depth + 1 = 2
    });
  });

  describe("rapid navigation scenarios", () => {
    it("handles push → back → push sequence correctly", () => {
      // Initial: list active
      let stack: readonly string[] = ["list"];
      let depth = 0;
      let exitingPanelId: string | null = null;

      // Push detail
      stack = ["list", "detail"];
      depth = 1;

      // Back to list (detail becomes exiting)
      stack = ["list"];
      depth = 0;
      exitingPanelId = "detail";

      // Verify detail is exiting
      let isExiting = computeIsExiting("detail", exitingPanelId, stack);
      expect(isExiting).toBe(true);

      // Push detail again BEFORE exitingPanelId clears
      stack = ["list", "detail"];
      depth = 1;
      // exitingPanelId is still "detail" (timeout hasn't fired yet)

      // Now detail should NOT be exiting because it's in the stack
      isExiting = computeIsExiting("detail", exitingPanelId, stack);
      expect(isExiting).toBe(false);

      // Panel depth should be correct
      const panelDepth = computePanelDepth("detail", isExiting, stack, depth);
      expect(panelDepth).toBe(1); // Not 2!
    });

    it("handles deep navigation with rapid back operations", () => {
      // Initial: list → detail → edit
      let stack: readonly string[] = ["list", "detail", "edit"];
      let depth = 2;
      let exitingPanelId: string | null = null;

      // Back to detail (edit becomes exiting)
      stack = ["list", "detail"];
      depth = 1;
      exitingPanelId = "edit";

      const editIsExiting = computeIsExiting("edit", exitingPanelId, stack);
      expect(editIsExiting).toBe(true);

      // Back to list immediately (detail becomes exiting, edit timeout still pending)
      stack = ["list"];
      depth = 0;
      exitingPanelId = "detail"; // Updated to detail

      const detailIsExiting = computeIsExiting("detail", exitingPanelId, stack);
      expect(detailIsExiting).toBe(true);

      // Push to detail again
      stack = ["list", "detail"];
      depth = 1;
      // exitingPanelId still "detail"

      const detailIsExitingAfterPush = computeIsExiting("detail", exitingPanelId, stack);
      expect(detailIsExitingAfterPush).toBe(false);

      const detailDepth = computePanelDepth("detail", detailIsExitingAfterPush, stack, depth);
      expect(detailDepth).toBe(1);
    });
  });
});
