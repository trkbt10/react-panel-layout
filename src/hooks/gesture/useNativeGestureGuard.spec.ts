/**
 * @file Tests for useNativeGestureGuard hook.
 */
/* eslint-disable custom/no-as-outside-guard -- test requires overrides */
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { useNativeGestureGuard } from "./useNativeGestureGuard.js";

describe("useNativeGestureGuard", () => {
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
    // Override getBoundingClientRect directly instead of using vi.spyOn
    element.getBoundingClientRect = () => ({ ...defaultRect, ...rect });
    return { current: element };
  };

  /**
   * Creates a fake pointer event with preventDefault tracking.
   * Uses an object to track state instead of let variable.
   */
  const createFakePointerEvent = (props: {
    clientX: number;
    clientY: number;
    pointerType: string;
  }) => {
    const state = { preventDefaultCalled: false };
    const event = {
      ...props,
      preventDefault: () => {
        state.preventDefaultCalled = true;
      },
      wasDefaultPrevented: () => state.preventDefaultCalled,
    };
    return event as unknown as React.PointerEvent<HTMLElement> & { wasDefaultPrevented: () => boolean };
  };

  describe("overscroll behavior", () => {
    it("applies overscroll-behavior: contain when active and preventOverscroll is true", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useNativeGestureGuard({
          containerRef,
          active: true,
          preventOverscroll: true,
        }),
      );

      expect(result.current.containerProps.style.overscrollBehavior).toBe("contain");
    });

    it("applies overscroll-behavior immediately even when not active", () => {
      // Styles are applied immediately (not waiting for active) to prevent browser gestures
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useNativeGestureGuard({
          containerRef,
          active: false,
          preventOverscroll: true,
        }),
      );

      expect(result.current.containerProps.style.overscrollBehavior).toBe("contain");
    });

    it("does not apply overscroll-behavior when preventOverscroll is false", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useNativeGestureGuard({
          containerRef,
          active: true,
          preventOverscroll: false,
        }),
      );

      expect(result.current.containerProps.style.overscrollBehavior).toBeUndefined();
    });
  });

  describe("edge back prevention", () => {
    it("calls preventDefault for touch events in left edge zone", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useNativeGestureGuard({
          containerRef,
          active: true,
          preventEdgeBack: true,
          edgeWidth: 20,
        }),
      );

      const mockEvent = createFakePointerEvent({
        clientX: 10, // Within 20px edge zone
        clientY: 100,
        pointerType: "touch",
      });

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(mockEvent.wasDefaultPrevented()).toBe(true);
    });

    it("does not call preventDefault for touch events outside left edge zone", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useNativeGestureGuard({
          containerRef,
          active: true,
          preventEdgeBack: true,
          edgeWidth: 20,
        }),
      );

      const mockEvent = createFakePointerEvent({
        clientX: 50, // Outside 20px edge zone
        clientY: 100,
        pointerType: "touch",
      });

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(mockEvent.wasDefaultPrevented()).toBe(false);
    });

    it("does not call preventDefault for mouse events in edge zone", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useNativeGestureGuard({
          containerRef,
          active: true,
          preventEdgeBack: true,
          edgeWidth: 20,
        }),
      );

      const mockEvent = createFakePointerEvent({
        clientX: 10, // Within edge zone
        clientY: 100,
        pointerType: "mouse", // Not touch
      });

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(mockEvent.wasDefaultPrevented()).toBe(false);
    });

    it("does not call preventDefault when not active", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useNativeGestureGuard({
          containerRef,
          active: false,
          preventEdgeBack: true,
          edgeWidth: 20,
        }),
      );

      const mockEvent = createFakePointerEvent({
        clientX: 10,
        clientY: 100,
        pointerType: "touch",
      });

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(mockEvent.wasDefaultPrevented()).toBe(false);
    });

    it("does not call preventDefault when preventEdgeBack is false", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useNativeGestureGuard({
          containerRef,
          active: true,
          preventEdgeBack: false,
          edgeWidth: 20,
        }),
      );

      // onPointerDown should be undefined when preventEdgeBack is false
      expect(result.current.containerProps.onPointerDown).toBeUndefined();
    });

    it("does not provide onPointerDown when preventEdgeBack is false", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useNativeGestureGuard({
          containerRef,
          active: true,
          preventEdgeBack: false,
        }),
      );

      expect(result.current.containerProps.onPointerDown).toBeUndefined();
    });
  });

  describe("edge width configuration", () => {
    it("respects custom edge width", () => {
      const containerRef = createRef({ left: 0, right: 300 });
      const { result } = renderHook(() =>
        useNativeGestureGuard({
          containerRef,
          active: true,
          preventEdgeBack: true,
          edgeWidth: 50,
        }),
      );

      const mockEventInCustomEdge = createFakePointerEvent({
        clientX: 40, // Within 50px edge, but outside default 20px
        clientY: 100,
        pointerType: "touch",
      });

      act(() => {
        result.current.containerProps.onPointerDown?.(mockEventInCustomEdge);
      });

      expect(mockEventInCustomEdge.wasDefaultPrevented()).toBe(true);
    });
  });

  describe("iOS smooth scrolling", () => {
    it("always applies WebkitOverflowScrolling: touch", () => {
      const containerRef = createRef();
      const { result } = renderHook(() =>
        useNativeGestureGuard({
          containerRef,
          active: false,
        }),
      );

      expect(result.current.containerProps.style.WebkitOverflowScrolling).toBe("touch");
    });
  });

  describe("null container ref", () => {
    it("handles null container ref gracefully", () => {
      const containerRef = { current: null };
      const { result } = renderHook(() =>
        useNativeGestureGuard({
          containerRef,
          active: true,
          preventEdgeBack: true,
        }),
      );

      const mockEvent = createFakePointerEvent({
        clientX: 10,
        clientY: 100,
        pointerType: "touch",
      });

      // Should not throw
      act(() => {
        result.current.containerProps.onPointerDown?.(mockEvent);
      });

      expect(mockEvent.wasDefaultPrevented()).toBe(false);
    });
  });
});
