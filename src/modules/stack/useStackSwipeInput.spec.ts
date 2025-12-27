/**
 * @file Tests for useStackSwipeInput hook.
 */
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { useStackSwipeInput } from "./useStackSwipeInput.js";
import type { UseStackNavigationResult } from "./types.js";

describe("useStackSwipeInput", () => {
  type CallTracker = {
    calls: ReadonlyArray<ReadonlyArray<unknown>>;
    fn: (...args: ReadonlyArray<unknown>) => void;
  };

  const createCallTracker = (): CallTracker => {
    const calls: Array<ReadonlyArray<unknown>> = [];
    const fn = (...args: ReadonlyArray<unknown>): void => {
      calls.push(args);
    };
    return { calls, fn };
  };

  type MockNavigationState = {
    navigation: Pick<UseStackNavigationResult, "go" | "canGo" | "revealParent" | "dismissReveal" | "state">;
    calls: {
      go: CallTracker;
      canGo: CallTracker;
      revealParent: CallTracker;
      dismissReveal: CallTracker;
    };
  };

  const createRef = (width = 300): React.RefObject<HTMLDivElement> => {
    const element = document.createElement("div");
    Object.defineProperty(element, "clientWidth", { value: width });
    const defaultRect: DOMRect = {
      left: 0,
      right: width,
      top: 0,
      bottom: 500,
      width,
      height: 500,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
    Object.defineProperty(element, "getBoundingClientRect", {
      value: () => defaultRect,
    });
    return { current: element };
  };

  const createMockNavigation = (canGoBack = true): MockNavigationState => {
    const go = createCallTracker();
    const canGo = createCallTracker();
    const revealParent = createCallTracker();
    const dismissReveal = createCallTracker();
    const canGoFn = (direction: number): boolean => {
      canGo.fn(direction);
      return canGoBack;
    };
    return {
      navigation: {
        go: go.fn,
        canGo: canGoFn,
        revealParent: revealParent.fn,
        dismissReveal: dismissReveal.fn,
        state: {
          stack: ["root", "detail"],
          depth: 1,
          isRevealing: false,
          revealDepth: null,
        },
      },
      calls: {
        go,
        canGo,
        revealParent,
        dismissReveal,
      },
    };
  };

  /** Create a mock pointer event with preventDefault */
  const createMockPointerEvent = (props: {
    clientX: number;
    clientY: number;
    pointerId?: number;
    isPrimary?: boolean;
    pointerType?: string;
    button?: number;
  }): React.PointerEvent<HTMLElement> => ({
    clientX: props.clientX,
    clientY: props.clientY,
    pointerId: props.pointerId ?? 1,
    isPrimary: props.isPrimary ?? true,
    pointerType: props.pointerType ?? "touch",
    button: props.button ?? 0,
    preventDefault: () => {},
  } as React.PointerEvent<HTMLElement>);

  describe("initialization", () => {
    it("starts with isEdgeSwiping false and progress 0", () => {
      const containerRef = createRef();
      const { navigation } = createMockNavigation();

      const { result } = renderHook(() =>
        useStackSwipeInput({ containerRef, navigation }),
      );

      expect(result.current.isEdgeSwiping).toBe(false);
      expect(result.current.progress).toBe(0);
    });

    it("provides container props with style", () => {
      const containerRef = createRef();
      const { navigation } = createMockNavigation();

      const { result } = renderHook(() =>
        useStackSwipeInput({ containerRef, navigation }),
      );

      expect(result.current.containerProps.style).toBeDefined();
    });
  });

  describe("edge swipe to go back", () => {
    it("calls go(-1) when swiping from left edge", () => {
      const containerRef = createRef();
      const { navigation, calls } = createMockNavigation();

      const { result } = renderHook(() =>
        useStackSwipeInput({
          containerRef,
          navigation,
          edgeWidth: 20,
        }),
      );

      // Pointer down at left edge
      const downEvent = createMockPointerEvent({ clientX: 10, clientY: 100 });

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      expect(result.current.isEdgeSwiping).toBe(true);

      // Swipe right (to reveal previous panel) - must exceed 100px threshold
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 120, // 110px movement (exceeds 100px threshold)
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

      expect(calls.go.calls).toHaveLength(1);
      expect(calls.go.calls[0]?.[0]).toBe(-1);
    });

    it("does not activate when canGo returns false", () => {
      const containerRef = createRef();
      const { navigation } = createMockNavigation(false);

      const { result } = renderHook(() =>
        useStackSwipeInput({
          containerRef,
          navigation,
          edgeWidth: 20,
        }),
      );

      // Pointer down at left edge
      const downEvent = createMockPointerEvent({ clientX: 10, clientY: 100 });

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Should not activate because canGo(-1) is false
      expect(result.current.isEdgeSwiping).toBe(false);
    });
  });

  describe("progress tracking", () => {
    it("calculates progress based on displacement", () => {
      const containerRef = createRef(300);
      const { navigation } = createMockNavigation();

      const { result } = renderHook(() =>
        useStackSwipeInput({
          containerRef,
          navigation,
          edgeWidth: 20,
        }),
      );

      // Pointer down at left edge
      const downEvent = createMockPointerEvent({ clientX: 10, clientY: 100 });

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Move 150px (half the container width)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 160, // 150px from start
        clientY: 102,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.progress).toBeCloseTo(0.5, 1);
    });

    it("caps progress at 1.0", () => {
      const containerRef = createRef(300);
      const { navigation } = createMockNavigation();

      const { result } = renderHook(() =>
        useStackSwipeInput({
          containerRef,
          navigation,
          edgeWidth: 20,
        }),
      );

      // Pointer down at left edge
      const downEvent = createMockPointerEvent({ clientX: 10, clientY: 100 });

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Move beyond container width
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 400, // 390px from start (> 300px width)
        clientY: 102,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.progress).toBe(1);
    });
  });

  describe("disabled state", () => {
    it("does not track when disabled", () => {
      const containerRef = createRef();
      const { navigation } = createMockNavigation();

      const { result } = renderHook(() =>
        useStackSwipeInput({
          containerRef,
          navigation,
          enabled: false,
        }),
      );

      const downEvent = createMockPointerEvent({ clientX: 10, clientY: 100 });

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      expect(result.current.isEdgeSwiping).toBe(false);
    });
  });

  describe("edge configuration", () => {
    it("respects custom edge width", () => {
      const containerRef = createRef();
      const { navigation } = createMockNavigation();

      const { result } = renderHook(() =>
        useStackSwipeInput({
          containerRef,
          navigation,
          edgeWidth: 50,
        }),
      );

      // Pointer down within 50px edge
      const downEvent = createMockPointerEvent({ clientX: 40, clientY: 100 });

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      expect(result.current.isEdgeSwiping).toBe(true);
    });
  });
});
