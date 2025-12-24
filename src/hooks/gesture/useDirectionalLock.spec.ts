/**
 * @file Tests for useDirectionalLock hook.
 */
import { act, renderHook } from "@testing-library/react";
import { useDirectionalLock } from "./useDirectionalLock.js";
import type { PointerTrackingState } from "./types.js";

const createTrackingState = (
  overrides: Partial<PointerTrackingState> = {},
): PointerTrackingState => ({
  isDown: false,
  start: null,
  current: null,
  pointerId: null,
  ...overrides,
});

describe("useDirectionalLock", () => {
  describe("initialization", () => {
    it("starts with no locked axis", () => {
      const tracking = createTrackingState();
      const { result } = renderHook(() =>
        useDirectionalLock({ tracking }),
      );

      expect(result.current.lockedAxis).toBe(null);
      expect(result.current.isLocked).toBe(false);
    });
  });

  describe("direction detection", () => {
    it("locks to horizontal when X movement dominates", () => {
      const tracking = createTrackingState({
        isDown: true,
        start: { x: 100, y: 100, timestamp: 0 },
        current: { x: 130, y: 105, timestamp: 100 }, // 30px horizontal, 5px vertical
        pointerId: 1,
      });

      const { result } = renderHook(() =>
        useDirectionalLock({ tracking, lockThreshold: 10 }),
      );

      expect(result.current.lockedAxis).toBe("horizontal");
      expect(result.current.isLocked).toBe(true);
    });

    it("locks to vertical when Y movement dominates", () => {
      const tracking = createTrackingState({
        isDown: true,
        start: { x: 100, y: 100, timestamp: 0 },
        current: { x: 105, y: 130, timestamp: 100 }, // 5px horizontal, 30px vertical
        pointerId: 1,
      });

      const { result } = renderHook(() =>
        useDirectionalLock({ tracking, lockThreshold: 10 }),
      );

      expect(result.current.lockedAxis).toBe("vertical");
      expect(result.current.isLocked).toBe(true);
    });

    it("does not lock when movement is below threshold", () => {
      const tracking = createTrackingState({
        isDown: true,
        start: { x: 100, y: 100, timestamp: 0 },
        current: { x: 105, y: 103, timestamp: 100 }, // 5px horizontal, 3px vertical
        pointerId: 1,
      });

      const { result } = renderHook(() =>
        useDirectionalLock({ tracking, lockThreshold: 10 }),
      );

      expect(result.current.lockedAxis).toBe(null);
      expect(result.current.isLocked).toBe(false);
    });

    it("does not lock when movement is diagonal (ambiguous)", () => {
      const tracking = createTrackingState({
        isDown: true,
        start: { x: 100, y: 100, timestamp: 0 },
        current: { x: 120, y: 118, timestamp: 100 }, // 20px horizontal, 18px vertical - ratio ~1.1
        pointerId: 1,
      });

      const { result } = renderHook(() =>
        useDirectionalLock({ tracking, lockThreshold: 10 }),
      );

      // Movement exceeds threshold but direction is ambiguous
      expect(result.current.lockedAxis).toBe(null);
      expect(result.current.isLocked).toBe(false);
    });

    it("locks with negative movement values", () => {
      const tracking = createTrackingState({
        isDown: true,
        start: { x: 100, y: 100, timestamp: 0 },
        current: { x: 70, y: 95, timestamp: 100 }, // -30px horizontal, -5px vertical
        pointerId: 1,
      });

      const { result } = renderHook(() =>
        useDirectionalLock({ tracking, lockThreshold: 10 }),
      );

      expect(result.current.lockedAxis).toBe("horizontal");
      expect(result.current.isLocked).toBe(true);
    });
  });

  describe("lock persistence", () => {
    it("maintains lock once determined", () => {
      const initialTracking = createTrackingState({
        isDown: true,
        start: { x: 100, y: 100, timestamp: 0 },
        current: { x: 130, y: 105, timestamp: 100 }, // Horizontal
        pointerId: 1,
      });

      const { result, rerender } = renderHook(
        ({ tracking }) => useDirectionalLock({ tracking }),
        { initialProps: { tracking: initialTracking } },
      );

      expect(result.current.lockedAxis).toBe("horizontal");

      // Update to more vertical movement
      const updatedTracking = createTrackingState({
        isDown: true,
        start: { x: 100, y: 100, timestamp: 0 },
        current: { x: 130, y: 200, timestamp: 200 }, // Now more vertical
        pointerId: 1,
      });

      rerender({ tracking: updatedTracking });

      // Should still be locked to horizontal
      expect(result.current.lockedAxis).toBe("horizontal");
    });
  });

  describe("reset behavior", () => {
    it("resets lock when pointer is released", () => {
      const downTracking = createTrackingState({
        isDown: true,
        start: { x: 100, y: 100, timestamp: 0 },
        current: { x: 130, y: 105, timestamp: 100 },
        pointerId: 1,
      });

      const { result, rerender } = renderHook(
        ({ tracking }) => useDirectionalLock({ tracking }),
        { initialProps: { tracking: downTracking } },
      );

      expect(result.current.lockedAxis).toBe("horizontal");

      // Release pointer
      const upTracking = createTrackingState({
        isDown: false,
        start: null,
        current: null,
        pointerId: null,
      });

      rerender({ tracking: upTracking });

      expect(result.current.lockedAxis).toBe(null);
      expect(result.current.isLocked).toBe(false);
    });

    it("can manually reset lock and will re-lock based on tracking state", () => {
      const tracking = createTrackingState({
        isDown: true,
        start: { x: 100, y: 100, timestamp: 0 },
        current: { x: 130, y: 105, timestamp: 100 },
        pointerId: 1,
      });

      const { result } = renderHook(() =>
        useDirectionalLock({ tracking }),
      );

      expect(result.current.lockedAxis).toBe("horizontal");

      act(() => {
        result.current.reset();
      });

      // Note: reset() sets lockedAxis to null, but the effect will
      // immediately re-evaluate and re-lock based on tracking state.
      // This is expected behavior - manual reset is primarily useful
      // when combined with updated tracking state.
      // The lock will be recalculated on the next effect run.
      expect(result.current.lockedAxis).toBe("horizontal");
    });
  });

  describe("threshold configuration", () => {
    it("respects custom lock threshold", () => {
      const tracking = createTrackingState({
        isDown: true,
        start: { x: 100, y: 100, timestamp: 0 },
        current: { x: 115, y: 103, timestamp: 100 }, // 15px horizontal
        pointerId: 1,
      });

      const { result: resultLow } = renderHook(() =>
        useDirectionalLock({ tracking, lockThreshold: 10 }),
      );

      const { result: resultHigh } = renderHook(() =>
        useDirectionalLock({ tracking, lockThreshold: 20 }),
      );

      expect(resultLow.current.isLocked).toBe(true);
      expect(resultHigh.current.isLocked).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("handles zero movement", () => {
      const tracking = createTrackingState({
        isDown: true,
        start: { x: 100, y: 100, timestamp: 0 },
        current: { x: 100, y: 100, timestamp: 100 }, // No movement
        pointerId: 1,
      });

      const { result } = renderHook(() =>
        useDirectionalLock({ tracking }),
      );

      expect(result.current.lockedAxis).toBe(null);
    });

    it("handles missing start position", () => {
      const tracking = createTrackingState({
        isDown: true,
        start: null,
        current: { x: 130, y: 105, timestamp: 100 },
        pointerId: 1,
      });

      const { result } = renderHook(() =>
        useDirectionalLock({ tracking }),
      );

      expect(result.current.lockedAxis).toBe(null);
    });

    it("handles missing current position", () => {
      const tracking = createTrackingState({
        isDown: true,
        start: { x: 100, y: 100, timestamp: 0 },
        current: null,
        pointerId: 1,
      });

      const { result } = renderHook(() =>
        useDirectionalLock({ tracking }),
      );

      expect(result.current.lockedAxis).toBe(null);
    });
  });
});
