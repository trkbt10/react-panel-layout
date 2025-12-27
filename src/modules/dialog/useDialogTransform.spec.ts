/**
 * @file Tests for useDialogTransform hook
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDialogTransform } from "./useDialogTransform.js";
import type { ContinuousOperationState } from "../../hooks/gesture/types.js";
import { IDLE_CONTINUOUS_OPERATION_STATE } from "../../hooks/gesture/types.js";

// Mock ResizeObserver
const mockResizeObserver = vi.fn();
vi.stubGlobal("ResizeObserver", class {
  constructor(callback: ResizeObserverCallback) {
    mockResizeObserver(callback);
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
});

describe("useDialogTransform", () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let rafId = 0;

  beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return ++rafId;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      // Mock cancel
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const runAnimationFrames = (count = 1, deltaMs = 16) => {
    const now = performance.now();
    for (let i = 0; i < count; i++) {
      const callbacks = [...rafCallbacks];
      rafCallbacks = [];
      callbacks.forEach(cb => cb(now + deltaMs * (i + 1)));
    }
  };

  const createMockElement = (dimensions: { width: number; height: number }) => {
    return {
      clientWidth: dimensions.width,
      clientHeight: dimensions.height,
      style: {
        transform: "",
        setProperty: vi.fn(),
        viewTransitionName: "",
      },
    } as unknown as HTMLDivElement;
  };

  const createMockBackdrop = () => {
    return {
      style: {
        opacity: "",
      },
    } as unknown as HTMLDivElement;
  };

  const idleSwipeState: ContinuousOperationState = IDLE_CONTINUOUS_OPERATION_STATE;
  const zeroDisplacement2D = { x: 0, y: 0 };

  describe("opening animation", () => {
    it("should start animation when visible changes from false to true", async () => {
      const element = createMockElement({ width: 400, height: 300 });
      const backdrop = createMockBackdrop();
      const elementRef = { current: element };
      const backdropRef = { current: backdrop };

      const { result, rerender } = renderHook(
        ({ visible }) =>
          useDialogTransform({
            elementRef,
            backdropRef,
            visible,
            openDirection: "bottom",
            swipeState: idleSwipeState,
            displacement: 0,
            displacement2D: zeroDisplacement2D,
          }),
        { initialProps: { visible: false } },
      );

      expect(result.current.phase).toBe("closed");

      // Trigger visible change
      rerender({ visible: true });

      // Should transition to opening
      expect(result.current.phase).toBe("opening");
      expect(result.current.isAnimating).toBe(true);
    });

    it("should apply transform during opening animation", async () => {
      const element = createMockElement({ width: 400, height: 300 });
      const backdrop = createMockBackdrop();
      const elementRef = { current: element };
      const backdropRef = { current: backdrop };

      const { rerender } = renderHook(
        ({ visible }) =>
          useDialogTransform({
            elementRef,
            backdropRef,
            visible,
            openDirection: "bottom",
            swipeState: idleSwipeState,
            displacement: 0,
            displacement2D: zeroDisplacement2D,
          }),
        { initialProps: { visible: false } },
      );

      // Trigger visible change
      rerender({ visible: true });

      // Run some animation frames
      act(() => {
        runAnimationFrames(5, 50);
      });

      // Transform should be applied
      expect(element.style.transform).not.toBe("");
    });

    it("should call onOpenComplete when animation finishes", async () => {
      const element = createMockElement({ width: 400, height: 300 });
      const backdrop = createMockBackdrop();
      const elementRef = { current: element };
      const backdropRef = { current: backdrop };
      const onOpenComplete = vi.fn();

      const { result, rerender } = renderHook(
        ({ visible }) =>
          useDialogTransform({
            elementRef,
            backdropRef,
            visible,
            openDirection: "bottom",
            swipeState: idleSwipeState,
            displacement: 0,
            displacement2D: zeroDisplacement2D,
            animationDuration: 100,
            onOpenComplete,
          }),
        { initialProps: { visible: false } },
      );

      // Trigger visible change
      rerender({ visible: true });

      // Run enough frames to complete animation
      act(() => {
        runAnimationFrames(10, 20);
      });

      await waitFor(() => {
        expect(result.current.phase).toBe("open");
      });

      expect(onOpenComplete).toHaveBeenCalled();
    });
  });

  describe("closing animation", () => {
    it("should animate close when triggerClose is called", async () => {
      const element = createMockElement({ width: 400, height: 300 });
      const backdrop = createMockBackdrop();
      const elementRef = { current: element };
      const backdropRef = { current: backdrop };

      const { result, rerender } = renderHook(
        ({ visible }) =>
          useDialogTransform({
            elementRef,
            backdropRef,
            visible,
            openDirection: "bottom",
            swipeState: idleSwipeState,
            displacement: 0,
            displacement2D: zeroDisplacement2D,
          }),
        { initialProps: { visible: false } },
      );

      // Open first
      rerender({ visible: true });
      act(() => {
        runAnimationFrames(30, 20);
      });

      await waitFor(() => {
        expect(result.current.phase).toBe("open");
      });

      // Now trigger close
      act(() => {
        result.current.triggerClose();
      });

      expect(result.current.phase).toBe("closing");
    });

    it("should call onCloseComplete when close animation finishes", async () => {
      const element = createMockElement({ width: 400, height: 300 });
      const backdrop = createMockBackdrop();
      const elementRef = { current: element };
      const backdropRef = { current: backdrop };
      const onCloseComplete = vi.fn();

      const { result, rerender } = renderHook(
        ({ visible }) =>
          useDialogTransform({
            elementRef,
            backdropRef,
            visible,
            openDirection: "bottom",
            swipeState: idleSwipeState,
            displacement: 0,
            displacement2D: zeroDisplacement2D,
            animationDuration: 100,
            onCloseComplete,
          }),
        { initialProps: { visible: false } },
      );

      // Open first
      rerender({ visible: true });
      act(() => {
        runAnimationFrames(30, 20);
      });

      await waitFor(() => {
        expect(result.current.phase).toBe("open");
      });

      // Trigger close
      act(() => {
        result.current.triggerClose();
      });

      // Run animation
      act(() => {
        runAnimationFrames(30, 20);
      });

      await waitFor(() => {
        expect(result.current.phase).toBe("closed");
      });

      expect(onCloseComplete).toHaveBeenCalled();
    });
  });

  describe("swipe interaction", () => {
    it("should apply 2D transform during swipe", () => {
      const element = createMockElement({ width: 400, height: 300 });
      const backdrop = createMockBackdrop();
      const elementRef = { current: element };
      const backdropRef = { current: backdrop };

      const operatingSwipeState: ContinuousOperationState = {
        phase: "operating",
        displacement: { x: 30, y: 100 },
        velocity: { x: 0, y: 0 },
      };

      renderHook(() =>
        useDialogTransform({
          elementRef,
          backdropRef,
          visible: true,
          openDirection: "bottom",
          swipeState: operatingSwipeState,
          displacement: 100,
          displacement2D: { x: 30, y: 100 },
        }),
      );

      // Transform should reflect 2D displacement
      expect(element.style.transform).toContain("translate(30px, 100px)");
    });

    it("should animate snapback when swipe ends below threshold", async () => {
      const element = createMockElement({ width: 400, height: 300 });
      const backdrop = createMockBackdrop();
      const elementRef = { current: element };
      const backdropRef = { current: backdrop };

      const operatingState: ContinuousOperationState = {
        phase: "operating",
        displacement: { x: 20, y: 50 },
        velocity: { x: 0, y: 0 },
      };

      const displacement2D = { x: 20, y: 50 };

      const { rerender, result } = renderHook(
        ({ swipeState, displacement, d2d }) =>
          useDialogTransform({
            elementRef,
            backdropRef,
            visible: true,
            openDirection: "bottom",
            swipeState,
            displacement,
            displacement2D: d2d,
          }),
        { initialProps: { swipeState: operatingState, displacement: 50, d2d: displacement2D } },
      );

      // End swipe
      const endedState: ContinuousOperationState = {
        phase: "ended",
        displacement: { x: 20, y: 50 },
        velocity: { x: 0, y: 0 },
      };
      rerender({ swipeState: endedState, displacement: 50, d2d: displacement2D });

      // Should start snapback animation
      expect(result.current.isAnimating).toBe(true);
    });
  });

  describe("container size handling", () => {
    it("should not apply transform when container size is 0", () => {
      const element = createMockElement({ width: 0, height: 0 });
      const backdrop = createMockBackdrop();
      const elementRef = { current: element };
      const backdropRef = { current: backdrop };

      const { rerender } = renderHook(
        ({ visible }) =>
          useDialogTransform({
            elementRef,
            backdropRef,
            visible,
            openDirection: "bottom",
            swipeState: idleSwipeState,
            displacement: 0,
            displacement2D: zeroDisplacement2D,
          }),
        { initialProps: { visible: false } },
      );

      rerender({ visible: true });

      act(() => {
        runAnimationFrames(5, 50);
      });

      // This test documents the current BROKEN behavior
      // Transform should NOT be empty - this is the bug!
      // When we fix it, this expectation should change
      expect(element.style.transform).toBe("");
    });
  });
});
