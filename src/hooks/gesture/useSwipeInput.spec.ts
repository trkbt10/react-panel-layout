/**
 * @file Tests for useSwipeInput hook.
 */
/* eslint-disable no-restricted-globals -- test requires vi for timing control */
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { useSwipeInput } from "./useSwipeInput.js";

describe("useSwipeInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createRef = (): React.RefObject<HTMLDivElement> => {
    const element = document.createElement("div");
    return { current: element };
  };

  describe("initialization", () => {
    it("starts with idle state", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useSwipeInput({ containerRef, axis: "horizontal" }),
      );

      expect(result.current.state).toEqual({
        phase: "idle",
        displacement: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        direction: 0,
      });
    });

    it("provides container props with correct touch-action for horizontal", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useSwipeInput({ containerRef, axis: "horizontal" }),
      );

      expect(result.current.containerProps.style.touchAction).toBe("pan-y pinch-zoom");
    });

    it("provides container props with correct touch-action for vertical", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useSwipeInput({ containerRef, axis: "vertical" }),
      );

      expect(result.current.containerProps.style.touchAction).toBe("pan-x pinch-zoom");
    });
  });

  describe("horizontal swipe detection", () => {
    it("transitions to tracking on pointer down", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useSwipeInput({ containerRef, axis: "horizontal" }),
      );

      const mockEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(result.current.state.phase).toBe("tracking");
    });

    it("transitions to swiping when horizontal movement dominates", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useSwipeInput({ containerRef, axis: "horizontal" }),
      );

      // Pointer down
      const downEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Move horizontally (exceeds lock threshold)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 130, // 30px horizontal
        clientY: 102, // 2px vertical
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.state.phase).toBe("swiping");
      expect(result.current.state.direction).toBe(1); // Moving right
    });

    it("stays in tracking when locked to wrong axis", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useSwipeInput({ containerRef, axis: "horizontal" }),
      );

      // Pointer down
      const downEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Move vertically (wrong axis)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 102, // 2px horizontal
        clientY: 130, // 30px vertical
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.state.phase).toBe("tracking");
      expect(result.current.state.direction).toBe(0);
    });
  });

  describe("vertical swipe detection", () => {
    it("transitions to swiping when vertical movement dominates", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useSwipeInput({ containerRef, axis: "vertical" }),
      );

      // Pointer down
      const downEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Move vertically
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 102, // 2px horizontal
        clientY: 130, // 30px vertical
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.state.phase).toBe("swiping");
      expect(result.current.state.direction).toBe(1); // Moving down
    });
  });

  describe("direction detection", () => {
    it("detects leftward swipe (direction -1)", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useSwipeInput({ containerRef, axis: "horizontal" }),
      );

      const downEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Move left
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 70, // -30px horizontal
        clientY: 102,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.state.direction).toBe(-1);
    });

    it("detects upward swipe (direction -1)", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useSwipeInput({ containerRef, axis: "vertical" }),
      );

      const downEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Move up
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 102,
        clientY: 70, // -30px vertical
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.state.direction).toBe(-1);
    });
  });

  describe("swipe completion callback", () => {
    it("calls onSwipeEnd when swipe is triggered by distance", () => {
      const containerRef = createRef();
      const onSwipeEnd = vi.fn();

      const { result } = renderHook(() =>
        useSwipeInput({
          containerRef,
          axis: "horizontal",
          thresholds: { distanceThreshold: 50, velocityThreshold: 0.3, lockThreshold: 10 },
          onSwipeEnd,
        }),
      );

      // Pointer down
      const downEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Move horizontally past threshold
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 160, // 60px horizontal (past 50px threshold)
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

    it("does not call onSwipeEnd when threshold is not met", () => {
      const containerRef = createRef();
      const onSwipeEnd = vi.fn();

      const { result } = renderHook(() =>
        useSwipeInput({
          containerRef,
          axis: "horizontal",
          thresholds: { distanceThreshold: 50, velocityThreshold: 10, lockThreshold: 10 },
          onSwipeEnd,
        }),
      );

      // Pointer down
      const downEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Move horizontally but not enough
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 130, // 30px horizontal (below 50px threshold)
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

      expect(onSwipeEnd).not.toHaveBeenCalled();
    });
  });

  describe("disabled state", () => {
    it("does not track when disabled", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useSwipeInput({ containerRef, axis: "horizontal", enabled: false }),
      );

      const mockEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(result.current.state.phase).toBe("idle");
    });
  });

  describe("displacement and velocity tracking", () => {
    it("tracks displacement correctly", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useSwipeInput({ containerRef, axis: "horizontal" }),
      );

      const downEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      const moveEvent = new PointerEvent("pointermove", {
        clientX: 150,
        clientY: 120,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.state.displacement.x).toBe(50);
      expect(result.current.state.displacement.y).toBe(20);
    });
  });

  describe("wheel swipe (trackpad two-finger swipe)", () => {
    const createContainerRef = (): React.RefObject<HTMLDivElement> => {
      const element = document.createElement("div");
      document.body.appendChild(element);
      return { current: element };
    };

    const dispatchWheelEvent = (
      element: HTMLElement,
      deltaX: number,
      deltaY: number = 0,
    ) => {
      const event = new WheelEvent("wheel", {
        deltaX,
        deltaY,
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(event);
    };

    it("accumulates deltaX during wheel events", () => {
      const containerRef = createContainerRef();

      const { result } = renderHook(() =>
        useSwipeInput({
          containerRef,
          axis: "horizontal",
          enableWheel: true,
        }),
      );

      act(() => {
        dispatchWheelEvent(containerRef.current!, -30, 0);
      });

      expect(result.current.state.phase).toBe("swiping");
      expect(result.current.state.displacement.x).toBe(-30);

      act(() => {
        dispatchWheelEvent(containerRef.current!, -20, 0);
      });

      expect(result.current.state.displacement.x).toBe(-50);
    });

    it("ends wheel swipe after idle timeout", () => {
      const containerRef = createContainerRef();
      const onSwipeEnd = vi.fn();

      renderHook(() =>
        useSwipeInput({
          containerRef,
          axis: "horizontal",
          enableWheel: true,
          onSwipeEnd,
          thresholds: { distanceThreshold: 50, velocityThreshold: 0.5, lockThreshold: 10 },
        }),
      );

      act(() => {
        dispatchWheelEvent(containerRef.current!, -100, 0);
      });

      // Wait for idle timeout (default 150ms)
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(onSwipeEnd).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: -1,
        }),
      );
    });

    it("ignores vertical scroll when axis is horizontal", () => {
      const containerRef = createContainerRef();

      const { result } = renderHook(() =>
        useSwipeInput({
          containerRef,
          axis: "horizontal",
          enableWheel: true,
        }),
      );

      act(() => {
        // Primarily vertical scroll
        dispatchWheelEvent(containerRef.current!, 5, -100);
      });

      // Should not enter swiping because vertical is dominant
      expect(result.current.state.phase).toBe("idle");
    });

    it("can be disabled with enableWheel=false", () => {
      const containerRef = createContainerRef();

      const { result } = renderHook(() =>
        useSwipeInput({
          containerRef,
          axis: "horizontal",
          enableWheel: false,
        }),
      );

      act(() => {
        dispatchWheelEvent(containerRef.current!, -50, 0);
      });

      expect(result.current.state.phase).toBe("idle");
    });

    it("pointer takes priority over wheel when both active", () => {
      const containerRef = createContainerRef();

      const { result } = renderHook(() =>
        useSwipeInput({
          containerRef,
          axis: "horizontal",
          enableWheel: true,
        }),
      );

      // Start pointer swipe
      const downEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      const moveEvent = new PointerEvent("pointermove", {
        clientX: 130,
        clientY: 102,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.state.phase).toBe("swiping");
      expect(result.current.state.displacement.x).toBe(30);

      // Wheel event should be ignored when pointer is active
      act(() => {
        dispatchWheelEvent(containerRef.current!, -50, 0);
      });

      // State should still reflect pointer, not wheel
      expect(result.current.state.displacement.x).toBe(30);
    });
  });
});
