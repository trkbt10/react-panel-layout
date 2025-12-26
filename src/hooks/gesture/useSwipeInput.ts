/**
 * @file Hook for detecting swipe gestures on a container element.
 *
 * Combines pointer tracking and directional locking to detect swipe gestures.
 * Also supports trackpad two-finger swipe via wheel events.
 * Returns swipe state and container props for gesture handling.
 */
import * as React from "react";
import { usePointerTracking } from "./usePointerTracking.js";
import { useDirectionalLock } from "./useDirectionalLock.js";
import { useEffectEvent } from "../useEffectEvent.js";
import { calculateVelocity, determineDirection } from "./utils.js";
import type {
  GestureAxis,
  SwipeInputState,
  SwipeInputThresholds,
  UseSwipeInputOptions,
  UseSwipeInputResult,
  Vector2,
} from "./types.js";
import { DEFAULT_SWIPE_THRESHOLDS, IDLE_SWIPE_INPUT_STATE } from "./types.js";

/** Idle timeout to reset wheel state after swipe stops */
const WHEEL_RESET_TIMEOUT = 150;

/**
 * Evaluate swipe end and call callback if threshold is met.
 */
const evaluateSwipeEnd = (
  displacement: Vector2,
  velocity: Vector2,
  axis: GestureAxis,
  thresholds: SwipeInputThresholds,
  onSwipeEnd: ((state: SwipeInputState) => void) | undefined,
): void => {
  const axisDisplacement = axis === "horizontal" ? displacement.x : displacement.y;
  const axisVelocity = axis === "horizontal" ? velocity.x : velocity.y;

  const absDisplacement = Math.abs(axisDisplacement);
  const absVelocity = Math.abs(axisVelocity);

  const triggered = absDisplacement >= thresholds.distanceThreshold || absVelocity >= thresholds.velocityThreshold;

  if (triggered) {
    const direction = determineDirection(axisDisplacement);
    const endState: SwipeInputState = {
      phase: "ended",
      displacement,
      velocity,
      direction,
    };
    onSwipeEnd?.(endState);
  }
};

/**
 * Hook for detecting swipe gestures on a container element.
 */
export function useSwipeInput(options: UseSwipeInputOptions): UseSwipeInputResult {
  const {
    containerRef,
    axis,
    enabled = true,
    thresholds: customThresholds,
    onSwipeEnd,
    enableWheel = true,
    pointerStartFilter,
  } = options;

  const thresholds: SwipeInputThresholds = {
    ...DEFAULT_SWIPE_THRESHOLDS,
    ...customThresholds,
  };

  // Stable callback for swipe end
  const handleSwipeEnd = useEffectEvent(onSwipeEnd);

  // ===== Pointer-based swipe tracking =====
  const { state: tracking, onPointerDown: baseOnPointerDown } = usePointerTracking({
    enabled,
  });

  // Wrap pointer down handler with optional filter
  const onPointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      if (!enabled) {
        return;
      }
      if (pointerStartFilter) {
        const container = containerRef.current;
        if (!container) {
          return;
        }
        if (!pointerStartFilter(event, container)) {
          return;
        }
      }
      baseOnPointerDown(event);
    },
    [enabled, pointerStartFilter, containerRef, baseOnPointerDown],
  );

  const { lockedAxis, isLocked } = useDirectionalLock({
    tracking,
    lockThreshold: thresholds.lockThreshold,
  });

  const lastActiveStateRef = React.useRef<SwipeInputState | null>(null);

  // Prevent native scroll when swiping on iOS
  const isLockedToSwipeAxisRef = React.useRef(false);

  React.useEffect(() => {
    isLockedToSwipeAxisRef.current = isLocked ? lockedAxis === axis : false;
  }, [isLocked, lockedAxis, axis]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) {
      return;
    }
    const disableTouchMove = (event: TouchEvent) => {
      event.preventDefault();
    };
    const handleTouchStart = (event: TouchEvent) => {
      if (isLockedToSwipeAxisRef.current) {
        event.preventDefault();
      }
      document.addEventListener("touchmove", disableTouchMove, { passive: false });
    };
    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", disableTouchMove);
    };
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);
    container.addEventListener("touchstart", handleTouchStart, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [containerRef, enabled]);

  // ===== Wheel-based swipe tracking =====
  const [wheelState, setWheelState] = React.useState<SwipeInputState>(IDLE_SWIPE_INPUT_STATE);
  const wheelAccumulatedRef = React.useRef({ x: 0, y: 0 });
  const wheelIdleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelLockedRef = React.useRef(false);
  const wheelLockedAxisRef = React.useRef<GestureAxis | null>(null);

  const resetWheelState = React.useCallback(() => {
    wheelAccumulatedRef.current = { x: 0, y: 0 };
    wheelLockedRef.current = false;
    wheelLockedAxisRef.current = null;
    setWheelState(IDLE_SWIPE_INPUT_STATE);
  }, []);

  const endWheelSwipe = React.useCallback(() => {
    const displacement = { ...wheelAccumulatedRef.current };
    evaluateSwipeEnd(displacement, { x: 0, y: 0 }, axis, thresholds, handleSwipeEnd);
    resetWheelState();
  }, [axis, thresholds, handleSwipeEnd, resetWheelState]);

  const handleWheel = useEffectEvent((event: WheelEvent) => {
    if (!enabled || !enableWheel || tracking.isDown) {
      return;
    }

    const { deltaX, deltaY } = event;

    // Direction lock
    if (!wheelLockedRef.current) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX >= thresholds.lockThreshold || absY >= thresholds.lockThreshold) {
        wheelLockedRef.current = true;
        wheelLockedAxisRef.current = absX > absY ? "horizontal" : "vertical";
      }
    }

    // If locked to wrong axis, ignore
    if (wheelLockedRef.current && wheelLockedAxisRef.current !== axis) {
      return;
    }

    // Accumulate displacement (negate: wheel delta is scroll direction)
    wheelAccumulatedRef.current.x -= deltaX;
    wheelAccumulatedRef.current.y -= deltaY;

    const accumulated = wheelAccumulatedRef.current;
    const axisDisplacement = axis === "horizontal" ? accumulated.x : accumulated.y;

    setWheelState({
      phase: "swiping",
      displacement: { ...accumulated },
      velocity: { x: 0, y: 0 },
      direction: determineDirection(axisDisplacement),
    });

    // When wheel stops, treat as "release"
    if (wheelIdleTimerRef.current !== null) {
      clearTimeout(wheelIdleTimerRef.current);
    }
    wheelIdleTimerRef.current = setTimeout(endWheelSwipe, WHEEL_RESET_TIMEOUT);
  });

  // Set up wheel event listener
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled || !enableWheel) {
      return;
    }

    const listener = (event: WheelEvent) => {
      event.preventDefault();
      handleWheel(event);
    };

    container.addEventListener("wheel", listener, { passive: false });

    return () => {
      container.removeEventListener("wheel", listener);
      if (wheelIdleTimerRef.current !== null) {
        clearTimeout(wheelIdleTimerRef.current);
      }
    };
  }, [containerRef, enabled, enableWheel, handleWheel]);

  React.useEffect(() => {
    return () => {
      if (wheelIdleTimerRef.current !== null) {
        clearTimeout(wheelIdleTimerRef.current);
      }
    };
  }, []);

  // ===== Pointer swipe state =====
  const pointerState = React.useMemo<SwipeInputState>(() => {
    if (!tracking.isDown || !tracking.start || !tracking.current) {
      return IDLE_SWIPE_INPUT_STATE;
    }

    const deltaX = tracking.current.x - tracking.start.x;
    const deltaY = tracking.current.y - tracking.start.y;
    const displacement = { x: deltaX, y: deltaY };

    const velocity = {
      x: calculateVelocity(deltaX, tracking.start.timestamp, tracking.current.timestamp),
      y: calculateVelocity(deltaY, tracking.start.timestamp, tracking.current.timestamp),
    };

    if (!isLocked || lockedAxis !== axis) {
      return { phase: "tracking", displacement, velocity, direction: 0 };
    }

    const axisDisplacement = axis === "horizontal" ? deltaX : deltaY;
    return {
      phase: "swiping",
      displacement,
      velocity,
      direction: determineDirection(axisDisplacement),
    };
  }, [tracking.isDown, tracking.start, tracking.current, isLocked, lockedAxis, axis]);

  React.useEffect(() => {
    if (pointerState.phase !== "idle") {
      lastActiveStateRef.current = pointerState;
    }
  }, [pointerState]);

  // Handle pointer up (but not cancel)
  React.useEffect(() => {
    if (tracking.isDown) {
      return;
    }

    const lastState = lastActiveStateRef.current;
    if (!lastState || (lastState.phase !== "swiping" && lastState.phase !== "tracking")) {
      return;
    }

    lastActiveStateRef.current = null;

    // Skip navigation if the gesture was canceled (e.g., browser took over for native scroll)
    if (tracking.wasCanceled) {
      return;
    }

    evaluateSwipeEnd(lastState.displacement, lastState.velocity, axis, thresholds, handleSwipeEnd);
  }, [tracking.isDown, tracking.wasCanceled, axis, thresholds, handleSwipeEnd]);

  // Merge states
  const state = pointerState.phase !== "idle" ? pointerState : wheelState;

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

  return { state, containerProps };
}
