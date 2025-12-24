/**
 * @file Hook for detecting swipe gestures that originate from the edge of a container.
 *
 * Edge swipes are commonly used for "swipe back" navigation in mobile apps.
 * This hook detects swipes that start within a configurable edge zone.
 */
import * as React from "react";
import { usePointerTracking } from "./usePointerTracking.js";
import { useDirectionalLock } from "./useDirectionalLock.js";
import { useEffectEvent } from "../useEffectEvent.js";
import type {
  GestureAxis,
  GestureEdge,
  SwipeInputState,
  SwipeInputThresholds,
  UseEdgeSwipeInputOptions,
  UseEdgeSwipeInputResult,
} from "./types.js";
import { DEFAULT_EDGE_WIDTH, DEFAULT_SWIPE_THRESHOLDS, IDLE_SWIPE_INPUT_STATE } from "./types.js";

/**
 * Get the axis associated with an edge.
 */
const getAxisForEdge = (edge: GestureEdge): GestureAxis => {
  return edge === "left" || edge === "right" ? "horizontal" : "vertical";
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
 * Calculate velocity from displacement and time elapsed.
 */
const calculateVelocity = (
  displacement: number,
  startTime: number,
  currentTime: number,
): number => {
  const elapsed = currentTime - startTime;
  if (elapsed <= 0) {
    return 0;
  }
  return displacement / elapsed;
};

/**
 * Determine direction from displacement.
 */
const determineDirection = (displacement: number): -1 | 0 | 1 => {
  if (displacement > 0) {
    return 1;
  }
  if (displacement < 0) {
    return -1;
  }
  return 0;
};

/**
 * Check if swipe threshold is met.
 */
const isSwipeTriggered = (
  displacement: number,
  velocity: number,
  thresholds: SwipeInputThresholds,
): boolean => {
  const absDisplacement = Math.abs(displacement);
  const absVelocity = Math.abs(velocity);

  return absDisplacement >= thresholds.distanceThreshold ||
    absVelocity >= thresholds.velocityThreshold;
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

  const thresholds: SwipeInputThresholds = {
    ...DEFAULT_SWIPE_THRESHOLDS,
    ...customThresholds,
  };

  const axis = getAxisForEdge(edge);

  // Track whether the current gesture started from the edge
  const [isEdgeGesture, setIsEdgeGesture] = React.useState(false);

  // Track pointer state
  const { state: tracking, onPointerDown: baseOnPointerDown } = usePointerTracking({
    enabled,
  });

  // Lock direction
  const { lockedAxis, isLocked } = useDirectionalLock({
    tracking,
    lockThreshold: thresholds.lockThreshold,
  });

  // Stable callback for swipe end
  const handleSwipeEnd = useEffectEvent(onSwipeEnd);

  // Store the last active state for checking when pointer is released
  const lastActiveStateRef = React.useRef<SwipeInputState | null>(null);

  // Custom pointer down handler that checks edge zone
  const onPointerDown = React.useCallback((event: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container || !enabled) {
      return;
    }

    const inEdge = isInEdgeZone(event.clientX, event.clientY, container, edge, edgeWidth);
    setIsEdgeGesture(inEdge);

    if (inEdge) {
      baseOnPointerDown(event);
    }
  }, [containerRef, enabled, edge, edgeWidth, baseOnPointerDown]);

  // Reset edge gesture state when tracking ends
  React.useEffect(() => {
    if (!tracking.isDown) {
      setIsEdgeGesture(false);
    }
  }, [tracking.isDown]);

  // Calculate current swipe state
  const state = React.useMemo<SwipeInputState>(() => {
    if (!isEdgeGesture || !tracking.isDown || !tracking.start || !tracking.current) {
      return IDLE_SWIPE_INPUT_STATE;
    }

    const deltaX = tracking.current.x - tracking.start.x;
    const deltaY = tracking.current.y - tracking.start.y;
    const displacement = { x: deltaX, y: deltaY };

    const velocityX = calculateVelocity(deltaX, tracking.start.timestamp, tracking.current.timestamp);
    const velocityY = calculateVelocity(deltaY, tracking.start.timestamp, tracking.current.timestamp);
    const velocity = { x: velocityX, y: velocityY };

    // Determine phase based on lock state
    if (!isLocked) {
      return {
        phase: "tracking",
        displacement,
        velocity,
        direction: 0,
      };
    }

    // If locked to wrong axis, stay in tracking (don't become swiping)
    if (lockedAxis !== axis) {
      return {
        phase: "tracking",
        displacement,
        velocity,
        direction: 0,
      };
    }

    // Locked to correct axis - now swiping
    const axisDisplacement = axis === "horizontal" ? deltaX : deltaY;
    const direction = determineDirection(axisDisplacement);

    return {
      phase: "swiping",
      displacement,
      velocity,
      direction,
    };
  }, [isEdgeGesture, tracking.isDown, tracking.start, tracking.current, isLocked, lockedAxis, axis]);

  // Store the last active state when tracking is active
  React.useEffect(() => {
    if (state.phase !== "idle") {
      lastActiveStateRef.current = state;
    }
  }, [state]);

  // Handle pointer up - check if swipe was triggered
  React.useEffect(() => {
    if (tracking.isDown) {
      return;
    }

    const lastState = lastActiveStateRef.current;
    if (!lastState) {
      return;
    }

    // Clear the ref for next gesture
    lastActiveStateRef.current = null;

    // If we were swiping, check if threshold was met
    if (lastState.phase === "swiping" || lastState.phase === "tracking") {
      const axisDisplacement = axis === "horizontal" ? lastState.displacement.x : lastState.displacement.y;
      const axisVelocity = axis === "horizontal" ? lastState.velocity.x : lastState.velocity.y;

      if (isSwipeTriggered(axisDisplacement, axisVelocity, thresholds)) {
        const direction = determineDirection(axisDisplacement);
        const endState: SwipeInputState = {
          phase: "ended",
          displacement: lastState.displacement,
          velocity: lastState.velocity,
          direction,
        };
        handleSwipeEnd?.(endState);
      }
    }
  }, [tracking.isDown, axis, thresholds, handleSwipeEnd]);

  // Container props for gesture handling
  const containerProps = React.useMemo(() => {
    const touchAction = axis === "horizontal" ? "pan-y pinch-zoom" : "pan-x pinch-zoom";

    return {
      onPointerDown,
      style: {
        touchAction,
        userSelect: "none" as const,
        WebkitUserSelect: "none" as const,
      },
    };
  }, [axis, onPointerDown]);

  return {
    isEdgeGesture,
    state,
    containerProps,
  };
}
