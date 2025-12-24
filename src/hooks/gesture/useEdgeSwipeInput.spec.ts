/**
 * @file Tests for useEdgeSwipeInput hook.
 */
/* eslint-disable no-restricted-globals, no-restricted-properties -- test requires vi for timing control */
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { useEdgeSwipeInput } from "./useEdgeSwipeInput.js";

describe("useEdgeSwipeInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createRef = (rect: Partial<DOMRect> = {}): React.RefObject<HTMLDivElement> => {
    const element = document.createElement("div");
    const defaultRect: DOMRect = {
      left: 0,
      right: 300,
      top: 0,
      bottom: 500,
      width: 300,
      height: 500,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({ ...defaultRect, ...rect });
    return { current: element };
  };

  describe("initialization", () => {
    it("starts with idle state and isEdgeGesture false", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "left" }),
      );

      expect(result.current.isEdgeGesture).toBe(false);
      expect(result.current.state).toEqual({
        phase: "idle",
        displacement: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        direction: 0,
      });
    });

    it("provides container props with correct touch-action for left edge", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "left" }),
      );

      expect(result.current.containerProps.style.touchAction).toBe("pan-y pinch-zoom");
    });

    it("provides container props with correct touch-action for top edge", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "top" }),
      );

      expect(result.current.containerProps.style.touchAction).toBe("pan-x pinch-zoom");
    });
  });

  describe("left edge detection", () => {
    it("activates when pointer down is within left edge zone", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "left", edgeWidth: 20 }),
      );

      const mockEvent = {
        clientX: 10, // Within 20px edge zone
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(result.current.isEdgeGesture).toBe(true);
      expect(result.current.state.phase).toBe("tracking");
    });

    it("does not activate when pointer down is outside left edge zone", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "left", edgeWidth: 20 }),
      );

      const mockEvent = {
        clientX: 50, // Outside 20px edge zone
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(result.current.isEdgeGesture).toBe(false);
      expect(result.current.state.phase).toBe("idle");
    });
  });

  describe("right edge detection", () => {
    it("activates when pointer down is within right edge zone", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "right", edgeWidth: 20 }),
      );

      const mockEvent = {
        clientX: 290, // Within 20px from right edge (300)
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(result.current.isEdgeGesture).toBe(true);
    });

    it("does not activate when pointer down is outside right edge zone", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "right", edgeWidth: 20 }),
      );

      const mockEvent = {
        clientX: 250, // Outside 20px from right edge
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(result.current.isEdgeGesture).toBe(false);
    });
  });

  describe("top edge detection", () => {
    it("activates when pointer down is within top edge zone", () => {
      const containerRef = createRef({ top: 0, bottom: 500 });
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "top", edgeWidth: 20 }),
      );

      const mockEvent = {
        clientX: 100,
        clientY: 10, // Within 20px from top edge
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(result.current.isEdgeGesture).toBe(true);
    });
  });

  describe("bottom edge detection", () => {
    it("activates when pointer down is within bottom edge zone", () => {
      const containerRef = createRef({ top: 0, bottom: 500 });
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "bottom", edgeWidth: 20 }),
      );

      const mockEvent = {
        clientX: 100,
        clientY: 490, // Within 20px from bottom edge (500)
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(result.current.isEdgeGesture).toBe(true);
    });
  });

  describe("swipe progression", () => {
    it("transitions to swiping when movement is in correct direction", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "left", edgeWidth: 20 }),
      );

      // Pointer down at edge
      const downEvent = {
        clientX: 10,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Move horizontally (past lock threshold)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 50, // 40px horizontal movement
        clientY: 102,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.state.phase).toBe("swiping");
      expect(result.current.state.direction).toBe(1); // Moving right
    });

    it("stays in tracking when locked to wrong axis", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "left", edgeWidth: 20 }),
      );

      const downEvent = {
        clientX: 10,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Move vertically (wrong axis for left edge)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 12,
        clientY: 150, // 50px vertical movement
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.state.phase).toBe("tracking");
      expect(result.current.state.direction).toBe(0);
    });
  });

  describe("swipe completion callback", () => {
    it("calls onSwipeEnd when edge swipe threshold is met", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const onSwipeEnd = vi.fn();

      const { result } = renderHook(() =>
        useEdgeSwipeInput({
          containerRef,
          edge: "left",
          edgeWidth: 20,
          thresholds: { distanceThreshold: 50, velocityThreshold: 0.3, lockThreshold: 10 },
          onSwipeEnd,
        }),
      );

      // Pointer down at edge
      const downEvent = {
        clientX: 10,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Move past threshold
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 70, // 60px movement (past 50px threshold)
        clientY: 105,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      // Pointer up
      const upEvent = new PointerEvent("pointerup", { pointerId: 1 });

      act(() => {
        document.dispatchEvent(upEvent);
      });

      expect(onSwipeEnd).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: "ended",
          direction: 1,
        }),
      );
    });

    it("does not call onSwipeEnd when gesture starts outside edge", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const onSwipeEnd = vi.fn();

      const { result } = renderHook(() =>
        useEdgeSwipeInput({
          containerRef,
          edge: "left",
          edgeWidth: 20,
          thresholds: { distanceThreshold: 50, velocityThreshold: 0.3, lockThreshold: 10 },
          onSwipeEnd,
        }),
      );

      // Pointer down outside edge
      const downEvent = {
        clientX: 50, // Outside 20px edge zone
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // The gesture should not be tracked, so no callback should be fired
      expect(result.current.isEdgeGesture).toBe(false);
      expect(onSwipeEnd).not.toHaveBeenCalled();
    });
  });

  describe("disabled state", () => {
    it("does not track when disabled", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "left", enabled: false }),
      );

      const mockEvent = {
        clientX: 10,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(result.current.isEdgeGesture).toBe(false);
      expect(result.current.state.phase).toBe("idle");
    });
  });

  describe("edge width configuration", () => {
    it("respects custom edge width", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "left", edgeWidth: 50 }),
      );

      const mockEvent = {
        clientX: 40, // Within 50px edge zone, but outside default 20px
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(result.current.isEdgeGesture).toBe(true);
    });
  });

  describe("reset behavior", () => {
    it("resets isEdgeGesture when pointer is released", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useEdgeSwipeInput({ containerRef, edge: "left", edgeWidth: 20 }),
      );

      // Pointer down at edge
      const downEvent = {
        clientX: 10,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      expect(result.current.isEdgeGesture).toBe(true);

      // Pointer up
      const upEvent = new PointerEvent("pointerup", { pointerId: 1 });

      act(() => {
        document.dispatchEvent(upEvent);
      });

      expect(result.current.isEdgeGesture).toBe(false);
    });
  });
});
