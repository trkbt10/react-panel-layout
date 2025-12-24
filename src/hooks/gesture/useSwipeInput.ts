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
import type {
  GestureAxis,
  SwipeInputState,
  SwipeInputThresholds,
  UseSwipeInputOptions,
  UseSwipeInputResult,
} from "./types.js";
import { DEFAULT_SWIPE_THRESHOLDS, IDLE_SWIPE_INPUT_STATE } from "./types.js";

/** Default idle timeout for wheel swipe in ms */
const DEFAULT_WHEEL_IDLE_TIMEOUT = 150;

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

  // Triggered if distance OR velocity threshold is exceeded
  return absDisplacement >= thresholds.distanceThreshold ||
    absVelocity >= thresholds.velocityThreshold;
};

/**
 * Hook for detecting swipe gestures on a container element.
 *
 * Tracks pointer movement and detects swipe gestures based on displacement
 * and velocity thresholds. Locks to the configured axis to prevent
 * diagonal gestures from triggering both swipe and scroll.
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { state, containerProps } = useSwipeInput({
 *   containerRef,
 *   axis: "horizontal",
 *   onSwipeEnd: (state) => {
 *     if (state.direction === 1) navigateNext();
 *     if (state.direction === -1) navigatePrev();
 *   },
 * });
 *
 * return <div ref={containerRef} {...containerProps}>{children}</div>;
 * ```
 */
export function useSwipeInput(options: UseSwipeInputOptions): UseSwipeInputResult {
  const {
    containerRef,
    axis,
    enabled = true,
    thresholds: customThresholds,
    onSwipeEnd,
    enableWheel = true,
    wheelIdleTimeout = DEFAULT_WHEEL_IDLE_TIMEOUT,
  } = options;

  const thresholds: SwipeInputThresholds = {
    ...DEFAULT_SWIPE_THRESHOLDS,
    ...customThresholds,
  };

  // ===== Pointer-based swipe tracking =====
  const { state: tracking, onPointerDown } = usePointerTracking({
    enabled,
  });

  const { lockedAxis, isLocked } = useDirectionalLock({
    tracking,
    lockThreshold: thresholds.lockThreshold,
  });

  // Stable callback for swipe end
  const handleSwipeEnd = useEffectEvent(onSwipeEnd);

  // Store the last active state for checking when pointer is released
  const lastActiveStateRef = React.useRef<SwipeInputState | null>(null);

  // ===== Wheel-based swipe tracking (for trackpad two-finger swipe) =====
  const [wheelState, setWheelState] = React.useState<SwipeInputState>(IDLE_SWIPE_INPUT_STATE);
  const wheelAccumulatedRef = React.useRef({ x: 0, y: 0 });
  const wheelStartTimeRef = React.useRef<number>(0);
  const wheelIdleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelLockedRef = React.useRef(false);
  const wheelLockedAxisRef = React.useRef<GestureAxis | null>(null);

  const resetWheelState = React.useCallback(() => {
    wheelAccumulatedRef.current = { x: 0, y: 0 };
    wheelStartTimeRef.current = 0;
    wheelLockedRef.current = false;
    wheelLockedAxisRef.current = null;
    setWheelState(IDLE_SWIPE_INPUT_STATE);
  }, []);

  const endWheelSwipe = React.useCallback(() => {
    const accumulated = wheelAccumulatedRef.current;
    const axisDisplacement = axis === "horizontal" ? accumulated.x : accumulated.y;

    if (Math.abs(axisDisplacement) >= thresholds.distanceThreshold) {
      const direction = determineDirection(axisDisplacement);
      const endState: SwipeInputState = {
        phase: "ended",
        displacement: { ...accumulated },
        velocity: { x: 0, y: 0 },
        direction,
      };
      handleSwipeEnd?.(endState);
    }

    resetWheelState();
  }, [axis, thresholds.distanceThreshold, handleSwipeEnd, resetWheelState]);

  const handleWheel = useEffectEvent((event: WheelEvent) => {
    if (!enabled || !enableWheel) {
      return;
    }

    // If pointer is active, ignore wheel
    if (tracking.isDown) {
      return;
    }

    const { deltaX, deltaY } = event;

    // Direction lock
    if (!wheelLockedRef.current) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const lockThreshold = thresholds.lockThreshold;

      if (absX >= lockThreshold || absY >= lockThreshold) {
        wheelLockedRef.current = true;
        wheelLockedAxisRef.current = absX > absY ? "horizontal" : "vertical";
      }
    }

    // If locked to wrong axis, ignore
    if (wheelLockedRef.current && wheelLockedAxisRef.current !== axis) {
      return;
    }

    // Check significant movement on our axis (use abs, direction doesn't matter for threshold)
    const absAxisDelta = axis === "horizontal" ? Math.abs(deltaX) : Math.abs(deltaY);
    if (!wheelLockedRef.current && absAxisDelta < thresholds.lockThreshold) {
      return;
    }

    // Initialize start time
    if (wheelStartTimeRef.current === 0) {
      wheelStartTimeRef.current = performance.now();
    }

    // Accumulate displacement (negate because wheel delta is scroll direction, not swipe direction)
    wheelAccumulatedRef.current.x -= deltaX;
    wheelAccumulatedRef.current.y -= deltaY;

    const accumulated = wheelAccumulatedRef.current;
    const axisDisplacement = axis === "horizontal" ? accumulated.x : accumulated.y;
    const direction = determineDirection(axisDisplacement);

    setWheelState({
      phase: "swiping",
      displacement: { ...accumulated },
      velocity: { x: 0, y: 0 },
      direction,
    });

    // Reset idle timer
    if (wheelIdleTimerRef.current !== null) {
      clearTimeout(wheelIdleTimerRef.current);
    }

    wheelIdleTimerRef.current = setTimeout(() => {
      endWheelSwipe();
    }, wheelIdleTimeout);
  });

  // Set up wheel event listener
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled || !enableWheel) {
      return;
    }

    const listener = (event: WheelEvent) => {
      const { deltaX, deltaY } = event;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Debug log
      console.log("[wheel]", { deltaX, deltaY, absX, absY });

      // Only prevent default for horizontal swipes on horizontal axis (or vice versa)
      const isHorizontalSwipe = absX > absY;
      const shouldPrevent = (axis === "horizontal" && isHorizontalSwipe) ||
                           (axis === "vertical" && !isHorizontalSwipe);

      if (shouldPrevent && (absX > 5 || absY > 5)) {
        event.preventDefault();
        event.stopPropagation();
      }

      handleWheel(event);
    };

    // Must be passive: false to allow preventDefault
    container.addEventListener("wheel", listener, { passive: false });

    return () => {
      container.removeEventListener("wheel", listener);
      if (wheelIdleTimerRef.current !== null) {
        clearTimeout(wheelIdleTimerRef.current);
      }
    };
  }, [containerRef, enabled, enableWheel, handleWheel, axis]);

  // Cleanup wheel timer on unmount
  React.useEffect(() => {
    return () => {
      if (wheelIdleTimerRef.current !== null) {
        clearTimeout(wheelIdleTimerRef.current);
      }
    };
  }, []);

  // ===== Pointer swipe state calculation =====
  const pointerState = React.useMemo<SwipeInputState>(() => {
    if (!tracking.isDown || !tracking.start || !tracking.current) {
      return IDLE_SWIPE_INPUT_STATE;
    }

    const deltaX = tracking.current.x - tracking.start.x;
    const deltaY = tracking.current.y - tracking.start.y;
    const displacement = { x: deltaX, y: deltaY };

    const velocityX = calculateVelocity(deltaX, tracking.start.timestamp, tracking.current.timestamp);
    const velocityY = calculateVelocity(deltaY, tracking.start.timestamp, tracking.current.timestamp);
    const velocity = { x: velocityX, y: velocityY };

    if (!isLocked) {
      return {
        phase: "tracking",
        displacement,
        velocity,
        direction: 0,
      };
    }

    if (lockedAxis !== axis) {
      return {
        phase: "tracking",
        displacement,
        velocity,
        direction: 0,
      };
    }

    const axisDisplacement = axis === "horizontal" ? deltaX : deltaY;
    const direction = determineDirection(axisDisplacement);

    return {
      phase: "swiping",
      displacement,
      velocity,
      direction,
    };
  }, [tracking.isDown, tracking.start, tracking.current, isLocked, lockedAxis, axis]);

  // Store the last active pointer state
  React.useEffect(() => {
    if (pointerState.phase !== "idle") {
      lastActiveStateRef.current = pointerState;
    }
  }, [pointerState]);

  // Handle pointer up - check if swipe was triggered
  React.useEffect(() => {
    if (tracking.isDown) {
      return;
    }

    const lastState = lastActiveStateRef.current;
    if (!lastState) {
      return;
    }

    lastActiveStateRef.current = null;

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

  // ===== Merge pointer and wheel states =====
  // Pointer takes priority when active
  const state = pointerState.phase !== "idle" ? pointerState : wheelState;

  // Container props for gesture handling
  const containerProps = React.useMemo(() => {
    const touchAction = axis === "horizontal" ? "pan-y pinch-zoom" : "pan-x pinch-zoom";

    return {
      onPointerDown,
      style: {
        touchAction,
        userSelect: "none" as const,
        WebkitUserSelect: "none" as const,
        overscrollBehavior: "contain",
        overscrollBehaviorX: axis === "horizontal" ? "contain" : "auto",
        overscrollBehaviorY: axis === "vertical" ? "contain" : "auto",
      } as React.CSSProperties,
    };
  }, [axis, onPointerDown]);

  return {
    state,
    containerProps,
  };
}
