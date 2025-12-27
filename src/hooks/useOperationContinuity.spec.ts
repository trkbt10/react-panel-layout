/**
 * @file Tests for useOperationContinuity hook.
 */
import * as React from "react";
import { renderHook } from "@testing-library/react";
import { useOperationContinuity } from "./useOperationContinuity.js";

const StrictModeWrapper = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  return React.createElement(React.StrictMode, null, children);
};

describe("useOperationContinuity", () => {
  describe("value continuity", () => {
    it("returns current value when not retaining", () => {
      const { result } = renderHook(() => useOperationContinuity("active", false));
      expect(result.current.value).toBe("active");
    });

    it("returns current value when retaining but value unchanged", () => {
      const { result } = renderHook(() => useOperationContinuity("active", true));
      expect(result.current.value).toBe("active");
    });

    it("retains previous value when shouldRetainPrevious is true", () => {
      const { result, rerender } = renderHook(
        ({ value, shouldRetainPrevious }) => useOperationContinuity(value, shouldRetainPrevious),
        { initialProps: { value: "behind", shouldRetainPrevious: true } },
      );

      expect(result.current.value).toBe("behind");

      // Value changes but we're still retaining
      rerender({ value: "active", shouldRetainPrevious: true });
      expect(result.current.value).toBe("behind");
    });

    it("accepts new value when shouldRetainPrevious becomes false", () => {
      const { result, rerender } = renderHook(
        ({ value, shouldRetainPrevious }) => useOperationContinuity(value, shouldRetainPrevious),
        { initialProps: { value: "behind", shouldRetainPrevious: true } },
      );

      // Value changes while retaining
      rerender({ value: "active", shouldRetainPrevious: true });
      expect(result.current.value).toBe("behind");

      // Stop retaining - should accept new value
      rerender({ value: "active", shouldRetainPrevious: false });
      expect(result.current.value).toBe("active");
    });

    it("updates stored value when not retaining", () => {
      const { result, rerender } = renderHook(
        ({ value, shouldRetainPrevious }) => useOperationContinuity(value, shouldRetainPrevious),
        { initialProps: { value: "behind", shouldRetainPrevious: false } },
      );

      rerender({ value: "active", shouldRetainPrevious: false });
      expect(result.current.value).toBe("active");

      // Start retaining - should keep "active"
      rerender({ value: "hidden", shouldRetainPrevious: true });
      expect(result.current.value).toBe("active");
    });
  });

  describe("changedDuringOperation tracking", () => {
    it("returns false when value never changed", () => {
      const { result, rerender } = renderHook(
        ({ value, retain }) => useOperationContinuity(value, retain),
        { initialProps: { value: "active", retain: true } },
      );

      expect(result.current.changedDuringOperation).toBe(false);

      // End retention without value change
      rerender({ value: "active", retain: false });
      expect(result.current.changedDuringOperation).toBe(false);
    });

    it("returns true when value changed during retention", () => {
      const { result, rerender } = renderHook(
        ({ value, retain }) => useOperationContinuity(value, retain),
        { initialProps: { value: "behind", retain: true } },
      );

      expect(result.current.changedDuringOperation).toBe(false);

      // Value changes while retaining
      rerender({ value: "active", retain: true });
      expect(result.current.changedDuringOperation).toBe(true);

      // End retention - should still be true (for this render)
      rerender({ value: "active", retain: false });
      expect(result.current.changedDuringOperation).toBe(true);
    });

    it("resets changedDuringOperation after operation ends", () => {
      const { result, rerender } = renderHook(
        ({ value, retain }) => useOperationContinuity(value, retain),
        { initialProps: { value: "behind", retain: true } },
      );

      // Value changes while retaining
      rerender({ value: "active", retain: true });
      expect(result.current.changedDuringOperation).toBe(true);

      // End retention
      rerender({ value: "active", retain: false });
      expect(result.current.changedDuringOperation).toBe(true);

      // Next render - should be reset
      rerender({ value: "active", retain: false });
      expect(result.current.changedDuringOperation).toBe(false);
    });

    it("tracks changes across multiple operations", () => {
      const { result, rerender } = renderHook(
        ({ value, retain }) => useOperationContinuity(value, retain),
        { initialProps: { value: "behind", retain: true } },
      );

      // First operation: value changes
      rerender({ value: "active", retain: true });
      rerender({ value: "active", retain: false });
      expect(result.current.changedDuringOperation).toBe(true);

      // Reset
      rerender({ value: "active", retain: false });
      expect(result.current.changedDuringOperation).toBe(false);

      // Second operation: no value change
      rerender({ value: "active", retain: true });
      rerender({ value: "active", retain: false });
      expect(result.current.changedDuringOperation).toBe(false);

      // Third operation: value changes again
      rerender({ value: "active", retain: true });
      rerender({ value: "hidden", retain: true });
      expect(result.current.changedDuringOperation).toBe(true);
      rerender({ value: "hidden", retain: false });
      expect(result.current.changedDuringOperation).toBe(true);
    });
  });

  describe("simultaneous value and retention change", () => {
    /**
     * CRITICAL: This tests the over-swipe bug scenario.
     *
     * In the real app, when user releases after over-swipe:
     * - displacement becomes 0 (shouldRetainPrevious becomes false)
     * - role changes from "active" to "hidden"
     * Both happen in the same render!
     *
     * The hook should detect that the value changed even though
     * the change happened at the exact moment retention ended.
     */
    it("detects value change when it happens simultaneously with retention ending", () => {
      const { result, rerender } = renderHook(
        ({ role, displacement }) => useOperationContinuity(role, displacement > 0),
        { initialProps: { role: "active" as const, displacement: 500 } },
      );

      // During swipe: role="active", retaining
      expect(result.current.value).toBe("active");
      expect(result.current.changedDuringOperation).toBe(false);

      // Simulate release: BOTH displacement becomes 0 AND role changes to "hidden"
      // This is what happens in the real app during over-swipe
      rerender({ role: "hidden" as const, displacement: 0 });

      // value should now be "hidden" (retention ended)
      expect(result.current.value).toBe("hidden");
      // CRITICAL: changedDuringOperation should be TRUE because the value
      // changed from "active" to "hidden" at the moment retention ended
      expect(result.current.changedDuringOperation).toBe(true);
    });

    it("does not report change when value stays the same at retention end", () => {
      const { result, rerender } = renderHook(
        ({ role, displacement }) => useOperationContinuity(role, displacement > 0),
        { initialProps: { role: "active" as const, displacement: 500 } },
      );

      expect(result.current.value).toBe("active");
      expect(result.current.changedDuringOperation).toBe(false);

      // Release but role stays "active" (e.g., partial swipe that didn't trigger navigation)
      rerender({ role: "active" as const, displacement: 0 });

      expect(result.current.value).toBe("active");
      // No change occurred
      expect(result.current.changedDuringOperation).toBe(false);
    });

    it("does NOT report change during button navigation (no operation)", () => {
      // This is the button navigation case: value changes but there was never
      // any retention (no swipe operation). We should NOT report changedDuringOperation
      // because this is normal navigation, not an operation-related change.
      const { result, rerender } = renderHook(
        ({ role, displacement }) => useOperationContinuity(role, displacement > 0),
        { initialProps: { role: "active" as const, displacement: 0 } },
      );

      expect(result.current.value).toBe("active");
      expect(result.current.changedDuringOperation).toBe(false);

      // Button navigation: role changes but there's no operation (displacement is always 0)
      rerender({ role: "behind" as const, displacement: 0 });

      expect(result.current.value).toBe("behind");
      // CRITICAL: changedDuringOperation should be FALSE because there was no operation
      // This allows the animation to happen normally for button navigation
      expect(result.current.changedDuringOperation).toBe(false);
    });
  });

  describe("role transition scenarios", () => {
    it("maintains role continuity during swipe (behind -> active)", () => {
      // Simulates: behind panel becomes active during swipe
      // displacement > 0, so we should retain the previous role
      const { result, rerender } = renderHook(
        ({ role, displacement }) => useOperationContinuity(role, displacement > 0),
        { initialProps: { role: "behind" as const, displacement: 100 } },
      );

      expect(result.current.value).toBe("behind");
      expect(result.current.changedDuringOperation).toBe(false);

      // Navigation changes role to "active" but displacement is still positive
      rerender({ role: "active" as const, displacement: 100 });
      expect(result.current.value).toBe("behind");
      expect(result.current.changedDuringOperation).toBe(true);

      // Swipe ends (displacement becomes 0)
      rerender({ role: "active" as const, displacement: 0 });
      expect(result.current.value).toBe("active");
      expect(result.current.changedDuringOperation).toBe(true);
    });

    it("maintains role continuity during swipe (active -> hidden)", () => {
      // Simulates: over-swipe where active panel becomes hidden
      const { result, rerender } = renderHook(
        ({ role, displacement }) => useOperationContinuity(role, displacement > 0),
        { initialProps: { role: "active" as const, displacement: 400 } },
      );

      expect(result.current.value).toBe("active");

      // Over-swipe triggers navigation change
      rerender({ role: "hidden" as const, displacement: 500 });
      expect(result.current.value).toBe("active");
      expect(result.current.changedDuringOperation).toBe(true);

      // Swipe ends
      rerender({ role: "hidden" as const, displacement: 0 });
      expect(result.current.value).toBe("hidden");
      expect(result.current.changedDuringOperation).toBe(true);
    });

    it("provides changedDuringOperation for animation decision", () => {
      // This test demonstrates the intended use case:
      // Use changedDuringOperation to decide whether to animate on operation end
      const { result, rerender } = renderHook(
        ({ role, displacement }) => useOperationContinuity(role, displacement > 0),
        { initialProps: { role: "behind" as const, displacement: 100 } },
      );

      // Simulate role change during swipe
      rerender({ role: "active" as const, displacement: 100 });

      // When swipe ends, changedDuringOperation tells us to skip animation
      rerender({ role: "active" as const, displacement: 0 });
      expect(result.current.changedDuringOperation).toBe(true);
      // Consumer would use this to skip target change animation
    });
  });

  describe("works with different value types", () => {
    it("works with numbers", () => {
      const { result, rerender } = renderHook(
        ({ value, retain }) => useOperationContinuity(value, retain),
        { initialProps: { value: 0, retain: true } },
      );

      rerender({ value: 1, retain: true });
      expect(result.current.value).toBe(0);

      rerender({ value: 1, retain: false });
      expect(result.current.value).toBe(1);
    });

    it("works with objects (by reference)", () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };

      const { result, rerender } = renderHook(
        ({ value, retain }) => useOperationContinuity(value, retain),
        { initialProps: { value: obj1, retain: true } },
      );

      rerender({ value: obj2, retain: true });
      expect(result.current.value).toBe(obj1);

      rerender({ value: obj2, retain: false });
      expect(result.current.value).toBe(obj2);
    });
  });

  describe("React StrictMode compatibility", () => {
    /**
     * CRITICAL: These tests verify the hook works correctly in StrictMode.
     *
     * In StrictMode, React calls the render function twice. Hooks that mutate
     * refs during render will see the mutated value on the second call, which
     * can cause bugs.
     *
     * This hook uses useLayoutEffect for ref mutations to avoid this issue.
     */
    it("operationJustEnded is correct in StrictMode", () => {
      const { result, rerender } = renderHook(
        ({ value, retain }) => useOperationContinuity(value, retain),
        {
          initialProps: { value: "active", retain: true },
          wrapper: StrictModeWrapper,
        },
      );

      // During retention
      expect(result.current.operationJustEnded).toBe(false);

      // End retention - operationJustEnded should be true
      rerender({ value: "active", retain: false });
      expect(result.current.operationJustEnded).toBe(true);

      // Next render - should be false again
      rerender({ value: "active", retain: false });
      expect(result.current.operationJustEnded).toBe(false);
    });

    it("over-swipe scenario works in StrictMode", () => {
      // This is the exact scenario that was broken before the fix:
      // User swipes beyond 100%, releases, and we need operationJustEnded=true
      // to prevent the visual jump.
      const { result, rerender } = renderHook(
        ({ role, displacement }) => useOperationContinuity(role, displacement > 0),
        {
          initialProps: { role: "active" as const, displacement: 500 },
          wrapper: StrictModeWrapper,
        },
      );

      // During over-swipe
      expect(result.current.value).toBe("active");
      expect(result.current.operationJustEnded).toBe(false);

      // Release (displacement becomes 0)
      rerender({ role: "active" as const, displacement: 0 });

      // CRITICAL: operationJustEnded must be true even in StrictMode
      // This is what was broken before the fix
      expect(result.current.operationJustEnded).toBe(true);
      expect(result.current.value).toBe("active");
    });

    it("changedDuringOperation is tracked correctly in StrictMode", () => {
      const { result, rerender } = renderHook(
        ({ value, retain }) => useOperationContinuity(value, retain),
        {
          initialProps: { value: "behind", retain: true },
          wrapper: StrictModeWrapper,
        },
      );

      expect(result.current.changedDuringOperation).toBe(false);

      // Value changes during retention
      rerender({ value: "active", retain: true });
      expect(result.current.changedDuringOperation).toBe(true);

      // End retention
      rerender({ value: "active", retain: false });
      expect(result.current.changedDuringOperation).toBe(true);
      expect(result.current.operationJustEnded).toBe(true);
    });
  });
});
