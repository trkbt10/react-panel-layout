/**
 * @file Tests for useAnimatedVisibility hook.
 *
 * アニメーション完了待機パターンのテスト:
 * 1. アニメーションなし → 即座にdisplay:none
 * 2. アニメーションあり → 完了待ってdisplay:none
 */
import type * as React from "react";
import { renderHook, act } from "@testing-library/react";
import { useAnimatedVisibility } from "./useAnimatedVisibility.js";

/**
 * Create a mock AnimationEvent for testing.
 */
function createMockAnimationEvent(
  target: EventTarget,
  currentTarget: EventTarget,
): React.AnimationEvent {
  const noop = (): void => {};
  const noopBool = (): boolean => false;
  const nativeEvent = {
    animationName: "test",
    elapsedTime: 0,
    pseudoElement: "",
  } as AnimationEvent;
  return {
    target,
    currentTarget,
    nativeEvent,
    bubbles: true,
    cancelable: false,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    preventDefault: noop,
    isDefaultPrevented: noopBool,
    stopPropagation: noop,
    isPropagationStopped: noopBool,
    persist: noop,
    timeStamp: Date.now(),
    type: "animationend",
    animationName: "test",
    elapsedTime: 0,
    pseudoElement: "",
  };
}

describe("useAnimatedVisibility", () => {
  describe("initial state", () => {
    it("displays when initially visible", () => {
      const { result } = renderHook(() =>
        useAnimatedVisibility({
          isVisible: true,
          leaveAnimation: "fadeOut 200ms ease-out",
        }),
      );

      expect(result.current.style.display).toBe("block");
      expect(result.current.state.shouldDisplay).toBe(true);
      expect(result.current.state.isAnimatingOut).toBe(false);
    });

    it("hides when initially not visible", () => {
      const { result } = renderHook(() =>
        useAnimatedVisibility({
          isVisible: false,
          leaveAnimation: "fadeOut 200ms ease-out",
        }),
      );

      expect(result.current.style.display).toBe("none");
      expect(result.current.state.shouldDisplay).toBe(false);
      expect(result.current.state.isAnimatingOut).toBe(false);
    });
  });

  describe("no animation", () => {
    it("hides immediately when leaveAnimation is undefined", () => {
      const { result, rerender } = renderHook(
        ({ isVisible }) => useAnimatedVisibility({ isVisible }),
        { initialProps: { isVisible: true } },
      );

      expect(result.current.style.display).toBe("block");

      rerender({ isVisible: false });

      // Should hide immediately (no animation to wait for)
      expect(result.current.style.display).toBe("none");
      expect(result.current.state.isAnimatingOut).toBe(false);
    });

    it("hides immediately when leaveAnimation is 'none'", () => {
      const { result, rerender } = renderHook(
        ({ isVisible }) =>
          useAnimatedVisibility({
            isVisible,
            leaveAnimation: "none",
          }),
        { initialProps: { isVisible: true } },
      );

      rerender({ isVisible: false });

      expect(result.current.style.display).toBe("none");
      expect(result.current.state.isAnimatingOut).toBe(false);
    });

    it("hides immediately when skipAnimation is true", () => {
      const { result, rerender } = renderHook(
        ({ isVisible }) =>
          useAnimatedVisibility({
            isVisible,
            leaveAnimation: "fadeOut 200ms ease-out",
            skipAnimation: true,
          }),
        { initialProps: { isVisible: true } },
      );

      rerender({ isVisible: false });

      expect(result.current.style.display).toBe("none");
      expect(result.current.state.isAnimatingOut).toBe(false);
    });
  });

  describe("with animation", () => {
    it("stays visible during leave animation", () => {
      const { result, rerender } = renderHook(
        ({ isVisible }) =>
          useAnimatedVisibility({
            isVisible,
            leaveAnimation: "fadeOut 200ms ease-out",
          }),
        { initialProps: { isVisible: true } },
      );

      rerender({ isVisible: false });

      // Should stay visible while animating out
      expect(result.current.style.display).toBe("block");
      expect(result.current.state.isAnimatingOut).toBe(true);
    });

    it("hides after animationEnd event", () => {
      const { result, rerender } = renderHook(
        ({ isVisible }) =>
          useAnimatedVisibility({
            isVisible,
            leaveAnimation: "fadeOut 200ms ease-out",
          }),
        { initialProps: { isVisible: true } },
      );

      rerender({ isVisible: false });
      expect(result.current.style.display).toBe("block");

      // Simulate animationend event
      const sharedElement = document.createElement("div");
      const mockEvent = createMockAnimationEvent(sharedElement, sharedElement);

      act(() => {
        result.current.props.onAnimationEnd(mockEvent);
      });

      // Now should be hidden
      expect(result.current.style.display).toBe("none");
      expect(result.current.state.isAnimatingOut).toBe(false);
    });

    it("ignores animationEnd from child elements", () => {
      const { result, rerender } = renderHook(
        ({ isVisible }) =>
          useAnimatedVisibility({
            isVisible,
            leaveAnimation: "fadeOut 200ms ease-out",
          }),
        { initialProps: { isVisible: true } },
      );

      rerender({ isVisible: false });

      // Simulate animationend from a child element (target !== currentTarget)
      const parent = document.createElement("div");
      const child = document.createElement("div");
      const mockEvent = createMockAnimationEvent(child, parent);

      act(() => {
        result.current.props.onAnimationEnd(mockEvent);
      });

      // Should still be visible (event was from child)
      expect(result.current.style.display).toBe("block");
      expect(result.current.state.isAnimatingOut).toBe(true);
    });
  });

  describe("rapid state changes", () => {
    it("shows again if made visible during leave animation", () => {
      const { result, rerender } = renderHook(
        ({ isVisible }) =>
          useAnimatedVisibility({
            isVisible,
            leaveAnimation: "fadeOut 200ms ease-out",
          }),
        { initialProps: { isVisible: true } },
      );

      // Start hiding
      rerender({ isVisible: false });
      expect(result.current.state.isAnimatingOut).toBe(true);

      // Immediately show again
      rerender({ isVisible: true });
      expect(result.current.style.display).toBe("block");
      expect(result.current.state.isAnimatingOut).toBe(false);
    });
  });

  describe("timeout fallback", () => {
    it("hides after timeout if animationEnd never fires", async () => {
      const { result, rerender } = renderHook(
        ({ isVisible }) =>
          useAnimatedVisibility({
            isVisible,
            leaveAnimation: "fadeOut 200ms ease-out",
            animationTimeout: 10,
          }),
        { initialProps: { isVisible: true } },
      );

      rerender({ isVisible: false });
      expect(result.current.style.display).toBe("block");
      expect(result.current.state.isAnimatingOut).toBe(true);

      // Advance time past timeout
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      // Should be hidden now (fallback triggered)
      expect(result.current.style.display).toBe("none");
      expect(result.current.state.isAnimatingOut).toBe(false);
    });

    it("clears timeout when animationEnd fires before timeout", async () => {
      const { result, rerender } = renderHook(
        ({ isVisible }) =>
          useAnimatedVisibility({
            isVisible,
            leaveAnimation: "fadeOut 200ms ease-out",
            animationTimeout: 10,
          }),
        { initialProps: { isVisible: true } },
      );

      rerender({ isVisible: false });

      // Fire animationEnd before timeout
      const sharedElement = document.createElement("div");
      const mockEvent = createMockAnimationEvent(sharedElement, sharedElement);

      act(() => {
        result.current.props.onAnimationEnd(mockEvent);
      });

      expect(result.current.style.display).toBe("none");

      // Advance past timeout - should not affect state
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      expect(result.current.style.display).toBe("none");
    });
  });
});
