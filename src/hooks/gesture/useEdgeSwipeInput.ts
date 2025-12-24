/**
 * @file Hook for detecting swipe gestures that originate from the edge of a container.
 *
 * Edge swipes are commonly used for "swipe back" navigation in mobile apps.
 * This hook detects swipes that start within a configurable edge zone.
 *
 * Built on top of useSwipeInput with edge zone filtering.
 */
import * as React from "react";
import { useSwipeInput } from "./useSwipeInput.js";
import type {
  GestureAxis,
  GestureEdge,
  SwipeInputState,
  UseEdgeSwipeInputOptions,
  UseEdgeSwipeInputResult,
} from "./types.js";
import { DEFAULT_EDGE_WIDTH, DEFAULT_SWIPE_THRESHOLDS, IDLE_SWIPE_INPUT_STATE } from "./types.js";

/**
 * Get the axis associated with an edge.
 */
const getAxisForEdge = (edge: GestureEdge): GestureAxis => {
  if (edge === "left" || edge === "right") {
    return "horizontal";
  }
  return "vertical";
};

/**
 * Check if a point is within the edge zone of a container.
 */
const isInEdgeZone = (
  clientX: number,
  clientY: number,
  container: HTMLElement,
  edge: GestureEdge,
  edgeWidth: number,
): boolean => {
  const rect = container.getBoundingClientRect();

  switch (edge) {
    case "left":
      return clientX >= rect.left && clientX <= rect.left + edgeWidth;
    case "right":
      return clientX >= rect.right - edgeWidth && clientX <= rect.right;
    case "top":
      return clientY >= rect.top && clientY <= rect.top + edgeWidth;
    case "bottom":
      return clientY >= rect.bottom - edgeWidth && clientY <= rect.bottom;
  }
};

/**
 * Hook for detecting swipe gestures that originate from the edge of a container.
 *
 * This is useful for implementing "swipe back" navigation patterns where
 * the user must start their swipe from the edge of the screen.
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { isEdgeGesture, state, containerProps } = useEdgeSwipeInput({
 *   containerRef,
 *   edge: "left",
 *   edgeWidth: 20,
 *   onSwipeEnd: (state) => {
 *     if (state.direction === 1) goBack();
 *   },
 * });
 *
 * return <div ref={containerRef} {...containerProps}>{children}</div>;
 * ```
 */
export function useEdgeSwipeInput(options: UseEdgeSwipeInputOptions): UseEdgeSwipeInputResult {
  const {
    containerRef,
    edge,
    edgeWidth = DEFAULT_EDGE_WIDTH,
    enabled = true,
    thresholds: customThresholds,
    onSwipeEnd,
  } = options;

  const thresholds = {
    ...DEFAULT_SWIPE_THRESHOLDS,
    ...customThresholds,
  };

  const axis = getAxisForEdge(edge);

  // Track whether the current gesture started from the edge
  const [isEdgeGesture, setIsEdgeGesture] = React.useState(false);

  // Create edge zone filter for pointer events
  const pointerStartFilter = React.useCallback(
    (event: React.PointerEvent, container: HTMLElement): boolean => {
      const inEdge = isInEdgeZone(event.clientX, event.clientY, container, edge, edgeWidth);
      setIsEdgeGesture(inEdge);
      return inEdge;
    },
    [edge, edgeWidth],
  );

  // Use base swipe input with edge filtering
  const { state, containerProps } = useSwipeInput({
    containerRef,
    axis,
    enabled,
    thresholds,
    onSwipeEnd,
    enableWheel: false, // Edge swipe doesn't use wheel events
    pointerStartFilter,
  });

  // Reset edge gesture state when swipe ends
  React.useEffect(() => {
    if (state.phase === "idle") {
      setIsEdgeGesture(false);
    }
  }, [state.phase]);

  // If not an edge gesture, return idle state
  const effectiveState: SwipeInputState = isEdgeGesture ? state : IDLE_SWIPE_INPUT_STATE;

  return {
    isEdgeGesture,
    state: effectiveState,
    containerProps,
  };
}
