/**
 * @file Tests for useOperationContinuity hook.
 */
import { renderHook } from "@testing-library/react";
import { useOperationContinuity } from "./useOperationContinuity.js";

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
});
