/**
 * @file Test utility for simulating gesture events.
 *
 * Provides a fluent API for simulating pointer events in tests,
 * making it easier to test swipe and drag gestures.
 */
import type * as React from "react";
import { act } from "@testing-library/react";

/**
 * Creates a complete mock React.PointerEvent with all required properties.
 */
function createFullPointerEvent(
  type: string,
  x: number,
  y: number,
  pointerId: number,
  pointerType: string,
): React.PointerEvent {
  const noop = (): void => {};
  const noopBool = (): boolean => false;

  const element = document.createElement("div");
  const nativeEvent = new PointerEvent(type, {
    clientX: x,
    clientY: y,
    pointerId,
    pointerType,
  });

  return {
    clientX: x,
    clientY: y,
    pointerId,
    pointerType,
    isPrimary: true,
    button: 0,
    preventDefault: noop,
    stopPropagation: noop,
    // Event target
    target: element,
    currentTarget: element,
    // Native event
    nativeEvent,
    // SyntheticEvent properties
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    isDefaultPrevented: noopBool,
    isPropagationStopped: noopBool,
    persist: noop,
    timeStamp: Date.now(),
    type,
    // MouseEvent properties
    altKey: false,
    buttons: 1,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    getModifierState: noopBool,
    movementX: 0,
    movementY: 0,
    pageX: x,
    pageY: y,
    relatedTarget: null,
    screenX: x,
    screenY: y,
    // PointerEvent properties
    height: 1,
    pressure: 0.5,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    width: 1,
    // UIEvent properties
    detail: 0,
    view: window,
  };
}

/**
 * 2D point for gesture coordinates.
 */
export type Point = {
  x: number;
  y: number;
};

/**
 * Options for creating a gesture simulator.
 */
export type GestureSimulatorOptions = {
  /** Container element or ref for coordinate calculations */
  container?: HTMLElement | null;
  /** Default pointer type. @default "touch" */
  pointerType?: "touch" | "mouse" | "pen";
  /** Default pointer ID. @default 1 */
  pointerId?: number;
};

/**
 * Gesture simulator for testing swipe and drag interactions.
 */
export type GestureSimulator = {
  /**
   * Simulate pointer down event.
   * @param x - X coordinate
   * @param y - Y coordinate
   */
  pointerDown: (x: number, y: number) => void;

  /**
   * Simulate pointer move event.
   * @param x - X coordinate
   * @param y - Y coordinate
   */
  pointerMove: (x: number, y: number) => void;

  /**
   * Simulate pointer up event.
   */
  pointerUp: () => void;

  /**
   * Simulate a complete swipe gesture.
   * @param from - Starting point
   * @param to - Ending point
   * @param steps - Number of intermediate move events. @default 10
   */
  swipe: (from: Point, to: Point, steps?: number) => void;

  /**
   * Simulate an edge swipe gesture.
   * @param edge - Edge to swipe from ("left" | "right" | "top" | "bottom")
   * @param distance - Distance to swipe in pixels
   * @param containerSize - Size of the container (width for left/right, height for top/bottom). @default 300
   */
  edgeSwipe: (
    edge: "left" | "right" | "top" | "bottom",
    distance: number,
    containerSize?: number,
  ) => void;

  /**
   * Create a React pointer event object for use with component handlers.
   * @param type - Event type (pointerdown, pointermove, pointerup)
   * @param x - X coordinate
   * @param y - Y coordinate
   */
  createReactPointerEvent: (
    type: "pointerdown" | "pointermove" | "pointerup",
    x: number,
    y: number,
  ) => React.PointerEvent;
};

/**
 * Creates a gesture simulator for testing.
 *
 * @example
 * ```tsx
 * const simulator = createGestureSimulator();
 *
 * // Simple pointer events
 * simulator.pointerDown(100, 100);
 * simulator.pointerMove(150, 100);
 * simulator.pointerUp();
 *
 * // Complete swipe
 * simulator.swipe({ x: 100, y: 100 }, { x: 200, y: 100 });
 *
 * // Edge swipe (iOS-style back gesture)
 * simulator.edgeSwipe("left", 100);
 * ```
 */
export function createGestureSimulator(options: GestureSimulatorOptions = {}): GestureSimulator {
  const {
    pointerType = "touch",
    pointerId = 1,
  } = options;

  const pointerState = { isDown: false };

  const pointerDown = (x: number, y: number): void => {
    pointerState.isDown = true;

    const event = new PointerEvent("pointerdown", {
      clientX: x,
      clientY: y,
      pointerId,
      pointerType,
      isPrimary: true,
      bubbles: true,
      cancelable: true,
      button: 0,
    });

    act(() => {
      document.dispatchEvent(event);
    });
  };

  const pointerMove = (x: number, y: number): void => {
    if (!pointerState.isDown) {
      return;
    }

    const event = new PointerEvent("pointermove", {
      clientX: x,
      clientY: y,
      pointerId,
      pointerType,
      isPrimary: true,
      bubbles: true,
      cancelable: true,
    });

    act(() => {
      document.dispatchEvent(event);
    });
  };

  const pointerUp = (): void => {
    if (!isDown) {
      return;
    }

    pointerState.isDown = false;

    const event = new PointerEvent("pointerup", {
      pointerId,
      pointerType,
      isPrimary: true,
      bubbles: true,
      cancelable: true,
    });

    act(() => {
      document.dispatchEvent(event);
    });
  };

  const swipe = (from: Point, to: Point, steps = 10): void => {
    pointerDown(from.x, from.y);

    // Generate intermediate points
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const x = from.x + (to.x - from.x) * progress;
      const y = from.y + (to.y - from.y) * progress;
      pointerMove(x, y);
    }

    pointerUp();
  };

  const edgeSwipe = (
    edge: "left" | "right" | "top" | "bottom",
    distance: number,
    containerSize = 300,
  ): void => {
    const edgeOffset = 10; // Start 10px from edge
    const getEdgeSwipePoints = (
      direction: "left" | "right" | "top" | "bottom",
      size: number,
      travel: number,
      offset: number,
    ): { from: Point; to: Point } => {
      if (direction === "left") {
        return {
          from: { x: offset, y: size / 2 },
          to: { x: offset + travel, y: size / 2 },
        };
      }
      if (direction === "right") {
        return {
          from: { x: size - offset, y: size / 2 },
          to: { x: size - offset - travel, y: size / 2 },
        };
      }
      if (direction === "top") {
        return {
          from: { x: size / 2, y: offset },
          to: { x: size / 2, y: offset + travel },
        };
      }
      return {
        from: { x: size / 2, y: size - offset },
        to: { x: size / 2, y: size - offset - travel },
      };
    };

    const { from, to } = getEdgeSwipePoints(edge, containerSize, distance, edgeOffset);

    swipe(from, to);
  };

  const createReactPointerEvent = (
    type: "pointerdown" | "pointermove" | "pointerup",
    x: number,
    y: number,
  ): React.PointerEvent => {
    return createFullPointerEvent(type, x, y, pointerId, pointerType);
  };

  return {
    pointerDown,
    pointerMove,
    pointerUp,
    swipe,
    edgeSwipe,
    createReactPointerEvent,
  };
}

/**
 * Creates a mock container element with specified dimensions.
 *
 * @example
 * ```tsx
 * const container = createMockContainer({ width: 300, height: 500 });
 * const ref = { current: container };
 * ```
 */
export function createMockContainer(options: {
  width?: number;
  height?: number;
  left?: number;
  top?: number;
} = {}): HTMLDivElement {
  const {
    width = 300,
    height = 500,
    left = 0,
    top = 0,
  } = options;

  const element = document.createElement("div");

  const rect: DOMRect = {
    left,
    right: left + width,
    top,
    bottom: top + height,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({}),
  };

  Object.defineProperties(element, {
    clientWidth: { value: width, writable: true },
    clientHeight: { value: height, writable: true },
    scrollWidth: { value: width, writable: true },
    scrollHeight: { value: height, writable: true },
    scrollLeft: { value: 0, writable: true },
    scrollTop: { value: 0, writable: true },
  });

  element.getBoundingClientRect = () => rect;

  return element;
}

/**
 * Creates a ref object with a mock container element.
 *
 * @example
 * ```tsx
 * const containerRef = createMockContainerRef({ width: 300, height: 500 });
 * const { result } = renderHook(() => useSwipeInput({ containerRef, axis: "horizontal" }));
 * ```
 */
export function createMockContainerRef(options: {
  width?: number;
  height?: number;
  left?: number;
  top?: number;
} = {}): React.RefObject<HTMLDivElement> {
  return { current: createMockContainer(options) };
}
