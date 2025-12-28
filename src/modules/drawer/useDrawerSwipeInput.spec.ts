/**
 * @file Tests for useDrawerSwipeInput hook.
 */
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { useDrawerSwipeInput } from "./useDrawerSwipeInput.js";

// ============================================================================
// Test helpers (fakes instead of mocks)
// ============================================================================

type CallTracker = {
  callCount: number;
  call: () => void;
};

function createCallTracker(): CallTracker {
  const tracker: CallTracker = {
    callCount: 0,
    call: () => {
      tracker.callCount++;
    },
  };
  return tracker;
}

describe("useDrawerSwipeInput", () => {
  const createRef = (width = 300, height = 500): React.RefObject<HTMLDivElement> => {
    const element = document.createElement("div");
    Object.defineProperty(element, "clientWidth", { value: width });
    Object.defineProperty(element, "clientHeight", { value: height });
    const defaultRect: DOMRect = {
      left: 0,
      right: width,
      top: 0,
      bottom: height,
      width,
      height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
    Object.defineProperty(element, "getBoundingClientRect", {
      value: () => defaultRect,
    });
    return { current: element };
  };

  /**
   * Type guard for creating test pointer events.
   * This pattern is allowed by lint rules for type assertions in test contexts.
   */
  function isPointerEvent(event: unknown): event is React.PointerEvent<HTMLElement> {
    if (typeof event !== "object" || event === null) {
      return false;
    }
    const e = event as Record<string, unknown>;
    return (
      typeof e.clientX === "number" &&
      typeof e.clientY === "number" &&
      typeof e.pointerId === "number" &&
      typeof e.preventDefault === "function"
    );
  }

  function createFakePointerEvent(props: {
    clientX: number;
    clientY: number;
    pointerId?: number;
    isPrimary?: boolean;
    pointerType?: string;
    button?: number;
  }): React.PointerEvent<HTMLElement> {
    const targetElement = document.createElement("div");
    const nativeEvent = new PointerEvent("pointerdown", {
      clientX: props.clientX,
      clientY: props.clientY,
      pointerId: props.pointerId ?? 1,
      isPrimary: props.isPrimary ?? true,
      pointerType: props.pointerType ?? "touch",
      button: props.button ?? 0,
      bubbles: true,
      cancelable: true,
    });

    const event = {
      clientX: props.clientX,
      clientY: props.clientY,
      pointerId: props.pointerId ?? 1,
      isPrimary: props.isPrimary ?? true,
      pointerType: props.pointerType ?? "touch",
      button: props.button ?? 0,
      preventDefault: () => {},
      stopPropagation: () => {},
      target: targetElement,
      currentTarget: targetElement,
      nativeEvent,
      persist: () => {},
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      bubbles: true,
      cancelable: true,
      type: "pointerdown",
      eventPhase: 0,
      isTrusted: false,
      timeStamp: Date.now(),
      defaultPrevented: false,
      // Additional properties for React.PointerEvent
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      detail: 0,
      view: window,
      screenX: 0,
      screenY: 0,
      pageX: props.clientX,
      pageY: props.clientY,
      movementX: 0,
      movementY: 0,
      buttons: 1,
      relatedTarget: null,
      getModifierState: () => false,
      height: 1,
      width: 1,
      pressure: 0.5,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
    };

    if (!isPointerEvent(event)) {
      throw new Error("Failed to create valid pointer event");
    }

    return event;
  }

  describe("initialization", () => {
    it("starts with isOpening and isClosing false", () => {
      const edgeContainerRef = createRef();
      const drawerContentRef = createRef();

      const { result } = renderHook(() =>
        useDrawerSwipeInput({
          edgeContainerRef,
          drawerContentRef,
          direction: "left",
          isOpen: false,
          onSwipeOpen: () => {},
          onSwipeClose: () => {},
        }),
      );

      expect(result.current.isOpening).toBe(false);
      expect(result.current.isClosing).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.displacement).toBe(0);
    });

    it("provides container props", () => {
      const edgeContainerRef = createRef();
      const drawerContentRef = createRef();

      const { result } = renderHook(() =>
        useDrawerSwipeInput({
          edgeContainerRef,
          drawerContentRef,
          direction: "left",
          isOpen: false,
          onSwipeOpen: () => {},
          onSwipeClose: () => {},
        }),
      );

      expect(result.current.edgeContainerProps.style).toBeDefined();
      expect(result.current.drawerContentProps.style).toBeDefined();
    });
  });

  describe("edge swipe to open (left drawer)", () => {
    it("calls onSwipeOpen when swiping from left edge", () => {
      const edgeContainerRef = createRef(300);
      const drawerContentRef = createRef(280);
      const openTracker = createCallTracker();
      const closeTracker = createCallTracker();

      const { result } = renderHook(() =>
        useDrawerSwipeInput({
          edgeContainerRef,
          drawerContentRef,
          direction: "left",
          isOpen: false,
          onSwipeOpen: openTracker.call,
          onSwipeClose: closeTracker.call,
          edgeWidth: 20,
        }),
      );

      // Pointer down at left edge
      const downEvent = createFakePointerEvent({ clientX: 10, clientY: 100 });

      act(() => {
        result.current.edgeContainerProps.onPointerDown?.(downEvent);
      });

      expect(result.current.isOpening).toBe(true);

      // Swipe right (to open drawer) - must exceed threshold
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 120,
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

      expect(openTracker.callCount).toBe(1);
      expect(closeTracker.callCount).toBe(0);
    });

    it("does not trigger open for reverse swipe direction", () => {
      const edgeContainerRef = createRef(300);
      const drawerContentRef = createRef(280);
      const openTracker = createCallTracker();

      const { result } = renderHook(() =>
        useDrawerSwipeInput({
          edgeContainerRef,
          drawerContentRef,
          direction: "left",
          isOpen: false,
          onSwipeOpen: openTracker.call,
          onSwipeClose: () => {},
          edgeWidth: 20,
        }),
      );

      // Pointer down at left edge
      const downEvent = createFakePointerEvent({ clientX: 10, clientY: 100 });

      act(() => {
        result.current.edgeContainerProps.onPointerDown?.(downEvent);
      });

      // Swipe left (wrong direction)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 5,
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

      expect(openTracker.callCount).toBe(0);
    });
  });

  describe("edge swipe to open (right drawer)", () => {
    it("calls onSwipeOpen when swiping from right edge", () => {
      const edgeContainerRef = createRef(300);
      const drawerContentRef = createRef(280);
      const openTracker = createCallTracker();

      const { result } = renderHook(() =>
        useDrawerSwipeInput({
          edgeContainerRef,
          drawerContentRef,
          direction: "right",
          isOpen: false,
          onSwipeOpen: openTracker.call,
          onSwipeClose: () => {},
          edgeWidth: 20,
        }),
      );

      // Pointer down at right edge (300 - 10 = 290)
      const downEvent = createFakePointerEvent({ clientX: 290, clientY: 100 });

      act(() => {
        result.current.edgeContainerProps.onPointerDown?.(downEvent);
      });

      expect(result.current.isOpening).toBe(true);

      // Swipe left (to open right drawer)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 180,
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

      expect(openTracker.callCount).toBe(1);
    });
  });

  describe("swipe to close", () => {
    it("calls onSwipeClose when dragging drawer closed", () => {
      const edgeContainerRef = createRef(300);
      const drawerContentRef = createRef(280);
      const closeTracker = createCallTracker();

      const { result } = renderHook(() =>
        useDrawerSwipeInput({
          edgeContainerRef,
          drawerContentRef,
          direction: "left",
          isOpen: true,
          onSwipeOpen: () => {},
          onSwipeClose: closeTracker.call,
          dismissThreshold: 0.3,
        }),
      );

      // Pointer down on drawer content
      const downEvent = createFakePointerEvent({ clientX: 100, clientY: 100 });

      act(() => {
        result.current.drawerContentProps.onPointerDown?.(downEvent);
      });

      // Wait for state update
      act(() => {});

      expect(result.current.isClosing).toBe(true);

      // Drag left to close (100px is ~36% of 280px drawer)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 0,
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

      expect(closeTracker.callCount).toBe(1);
    });

    it("does not close when below threshold", () => {
      const edgeContainerRef = createRef(300);
      const drawerContentRef = createRef(280);
      const closeTracker = createCallTracker();

      const { result } = renderHook(() =>
        useDrawerSwipeInput({
          edgeContainerRef,
          drawerContentRef,
          direction: "left",
          isOpen: true,
          onSwipeOpen: () => {},
          onSwipeClose: closeTracker.call,
          dismissThreshold: 0.3,
        }),
      );

      // Pointer down on drawer content
      const downEvent = createFakePointerEvent({ clientX: 100, clientY: 100 });

      act(() => {
        result.current.drawerContentProps.onPointerDown?.(downEvent);
      });

      // Small drag (only 20px, less than 30% of 280px)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 80,
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

      expect(closeTracker.callCount).toBe(0);
    });
  });

  describe("disabled states", () => {
    it("does not track edge swipe when enableEdgeSwipeOpen is false", () => {
      const edgeContainerRef = createRef();
      const drawerContentRef = createRef();

      const { result } = renderHook(() =>
        useDrawerSwipeInput({
          edgeContainerRef,
          drawerContentRef,
          direction: "left",
          isOpen: false,
          onSwipeOpen: () => {},
          onSwipeClose: () => {},
          enableEdgeSwipeOpen: false,
        }),
      );

      const downEvent = createFakePointerEvent({ clientX: 10, clientY: 100 });

      act(() => {
        result.current.edgeContainerProps.onPointerDown?.(downEvent);
      });

      expect(result.current.isOpening).toBe(false);
    });

    it("does not track close swipe when enableSwipeClose is false", () => {
      const edgeContainerRef = createRef();
      const drawerContentRef = createRef();

      const { result } = renderHook(() =>
        useDrawerSwipeInput({
          edgeContainerRef,
          drawerContentRef,
          direction: "left",
          isOpen: true,
          onSwipeOpen: () => {},
          onSwipeClose: () => {},
          enableSwipeClose: false,
        }),
      );

      const downEvent = createFakePointerEvent({ clientX: 100, clientY: 100 });

      act(() => {
        result.current.drawerContentProps.onPointerDown?.(downEvent);
      });

      expect(result.current.isClosing).toBe(false);
    });

    it("does not track edge swipe when drawer is already open", () => {
      const edgeContainerRef = createRef();
      const drawerContentRef = createRef();

      const { result } = renderHook(() =>
        useDrawerSwipeInput({
          edgeContainerRef,
          drawerContentRef,
          direction: "left",
          isOpen: true, // Already open
          onSwipeOpen: () => {},
          onSwipeClose: () => {},
        }),
      );

      const downEvent = createFakePointerEvent({ clientX: 10, clientY: 100 });

      act(() => {
        result.current.edgeContainerProps.onPointerDown?.(downEvent);
      });

      // Should not be opening because drawer is already open
      expect(result.current.isOpening).toBe(false);
    });

    it("does not track close swipe when drawer is closed", () => {
      const edgeContainerRef = createRef();
      const drawerContentRef = createRef();

      const { result } = renderHook(() =>
        useDrawerSwipeInput({
          edgeContainerRef,
          drawerContentRef,
          direction: "left",
          isOpen: false, // Already closed
          onSwipeOpen: () => {},
          onSwipeClose: () => {},
        }),
      );

      const downEvent = createFakePointerEvent({ clientX: 100, clientY: 100 });

      act(() => {
        result.current.drawerContentProps.onPointerDown?.(downEvent);
      });

      expect(result.current.isClosing).toBe(false);
    });
  });

  describe("state output", () => {
    it("provides correct ContinuousOperationState during open swipe", () => {
      const edgeContainerRef = createRef(300);
      const drawerContentRef = createRef(280);

      const { result } = renderHook(() =>
        useDrawerSwipeInput({
          edgeContainerRef,
          drawerContentRef,
          direction: "left",
          isOpen: false,
          onSwipeOpen: () => {},
          onSwipeClose: () => {},
          edgeWidth: 20,
        }),
      );

      // Initial state
      expect(result.current.state.phase).toBe("idle");

      // Pointer down at left edge
      const downEvent = createFakePointerEvent({ clientX: 10, clientY: 100 });

      act(() => {
        result.current.edgeContainerProps.onPointerDown?.(downEvent);
      });

      // During swipe
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 50,
        clientY: 105,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.state.phase).toBe("operating");
    });
  });
});
