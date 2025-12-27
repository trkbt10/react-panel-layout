/**
 * @file Shared hook for DOM-based swipe content transform.
 *
 * This hook provides immediate DOM manipulation for swipe gestures,
 * with smooth snap-back animation when the swipe ends.
 *
 * Used by both Pivot and Stack for consistent swipe behavior.
 */
import * as React from "react";
import { useAnimationFrame, interpolate, easings } from "./useAnimationFrame.js";
import type { GestureAxis } from "./gesture/types.js";

const DEFAULT_ANIMATION_DURATION = 300;

/**
 * Options for useSwipeContentTransform hook.
 */
export type UseSwipeContentTransformOptions = {
  /** Ref to the element to transform */
  elementRef: React.RefObject<HTMLElement | null>;
  /** Target position in pixels (where element should be at rest) */
  targetPx: number;
  /** Current swipe displacement in pixels */
  displacement: number;
  /** Whether swipe gesture is active */
  isOperating: boolean;
  /** Axis of transformation */
  axis?: GestureAxis;
  /** Duration of snap animation in ms */
  animationDuration?: number;
  /** Container size in pixels (used for snap on resize) */
  containerSize?: number;
  /**
   * Whether to animate when targetPx changes (without swipe).
   * Use this for tab bar animations triggered by click/button.
   * @default false
   */
  animateOnTargetChange?: boolean;
  /**
   * Initial position in pixels when first mounted.
   * If different from targetPx, will animate from initialPx to targetPx.
   * Use this for push animations where new panel comes from off-screen.
   */
  initialPx?: number;
  /**
   * Skip animation when targetPx changes.
   * Use this when the target changed during an operation (from useOperationContinuity).
   * When true, target changes will snap instead of animate.
   * @default false
   */
  skipTargetChangeAnimation?: boolean;
};

/**
 * Animation direction information.
 */
export type AnimationDirection = {
  /** Source position in pixels */
  from: number;
  /** Target position in pixels */
  to: number;
};

/**
 * Result from useSwipeContentTransform hook.
 */
export type UseSwipeContentTransformResult = {
  /** Whether snap animation is currently running */
  isAnimating: boolean;
  /** Current position in pixels (for visibility calculations) */
  currentPx: number;
  /** Animation direction info, or null if not animating */
  animationDirection: AnimationDirection | null;
};

/**
 * Get CSS transform function name for axis.
 */
const getTransformFn = (axis: GestureAxis): "translateX" | "translateY" => {
  return axis === "horizontal" ? "translateX" : "translateY";
};

/**
 * Check if initial mount animation should be scheduled.
 * Returns animation info if conditions are met, null otherwise.
 *
 * Conditions for scheduling:
 * 1. Animation not already consumed
 * 2. containerSize is valid (> 0) - handles React effect execution order
 * 3. initialPx is provided
 * 4. initialPx differs from targetPx
 */
const computeInitialMountAnimation = (
  hasConsumed: boolean,
  containerSize: number | undefined,
  initialPx: number | undefined,
  targetPx: number,
): { from: number; to: number } | null => {
  if (hasConsumed) {
    return null;
  }
  if (containerSize === undefined) {
    return null;
  }
  if (containerSize <= 0) {
    return null;
  }
  if (initialPx === undefined) {
    return null;
  }
  if (initialPx === targetPx) {
    return null;
  }
  return { from: initialPx, to: targetPx };
};

/**
 * Result type for target change handling.
 */
type TargetChangeResult =
  | { type: "animate"; animation: { from: number; to: number } }
  | { type: "snap"; position: number }
  | { type: "none" };

/**
 * Compute action for target position change when not swiping.
 * Returns the appropriate action: animate, snap, or none.
 *
 * @param skipAnimation - If true, skip animation and snap directly.
 *   Use this when the target changed during an operation (from useOperationContinuity).
 */
const computeTargetChangeAction = (
  targetPx: number,
  prevTargetPx: number,
  currentPx: number,
  isOperating: boolean,
  isAnimating: boolean,
  animateOnTargetChange: boolean,
  skipAnimation: boolean,
): TargetChangeResult => {
  if (targetPx === prevTargetPx) {
    return { type: "none" };
  }
  if (isOperating) {
    return { type: "none" };
  }
  if (isAnimating) {
    return { type: "none" };
  }
  if (!animateOnTargetChange) {
    return { type: "snap", position: targetPx };
  }

  const distance = Math.abs(currentPx - targetPx);
  if (distance <= 1) {
    return { type: "snap", position: targetPx };
  }

  // Skip animation if requested (e.g., role changed during operation)
  // This prevents unwanted animations after an operation ends.
  // However, allow forward animations (currentPx < targetPx) for normal swipe-to-complete.
  // Only skip backward animations (currentPx > targetPx) which occur during over-swipe.
  if (skipAnimation) {
    // Backward direction (over-swipe): snap, don't animate backward
    if (currentPx > targetPx) {
      return { type: "snap", position: targetPx };
    }
    // Forward direction (normal swipe-to-complete): animate from current position
    return { type: "animate", animation: { from: currentPx, to: targetPx } };
  }

  return { type: "animate", animation: { from: currentPx, to: targetPx } };
};

/**
 * Check if container size change requires position snap.
 * Returns the new position to snap to, or null if no snap needed.
 */
const computeContainerResizeSnap = (
  containerSize: number | undefined,
  prevContainerSize: number | undefined,
  targetPx: number,
): number | null => {
  if (containerSize === undefined) {
    return null;
  }
  if (containerSize === prevContainerSize) {
    return null;
  }
  if (containerSize <= 0) {
    return null;
  }
  return targetPx;
};

/**
 * Hook for DOM-based swipe content transform.
 *
 * During swipe: immediately updates element.style.transform to follow finger.
 * After swipe: animates from current position to target position.
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { isAnimating, currentPx } = useSwipeContentTransform({
 *   elementRef: containerRef,
 *   targetPx: 0,
 *   displacement: inputState.displacement.x,
 *   isOperating: inputState.phase === "swiping",
 * });
 * ```
 */
export function useSwipeContentTransform(
  options: UseSwipeContentTransformOptions,
): UseSwipeContentTransformResult {
  const {
    elementRef,
    targetPx,
    displacement,
    isOperating,
    axis = "horizontal",
    animationDuration = DEFAULT_ANIMATION_DURATION,
    containerSize,
    animateOnTargetChange = false,
    initialPx,
    skipTargetChangeAnimation = false,
  } = options;

  // Use initialPx if provided, otherwise use targetPx
  const effectiveInitialPx = initialPx ?? targetPx;
  const currentPxRef = React.useRef<number>(effectiveInitialPx);
  const animRef = React.useRef<{ from: number; to: number } | null>(null);
  const prevTargetPxRef = React.useRef<number>(targetPx);
  const prevContainerSizeRef = React.useRef<number | undefined>(containerSize);
  const pendingAnimationRef = React.useRef<{ from: number; to: number } | null>(null);
  // Track if initial mount animation has been consumed
  const hasConsumedInitialMountRef = React.useRef<boolean>(false);

  // Schedule animation on first mount if initialPx differs from targetPx.
  const initialMountAnimation = computeInitialMountAnimation(
    hasConsumedInitialMountRef.current,
    containerSize,
    initialPx,
    targetPx,
  );
  if (initialMountAnimation !== null) {
    pendingAnimationRef.current = initialMountAnimation;
    hasConsumedInitialMountRef.current = true;
  }

  // Handle target changes when not swiping
  const targetChangeAction = computeTargetChangeAction(
    targetPx,
    prevTargetPxRef.current,
    currentPxRef.current,
    isOperating,
    animRef.current !== null,
    animateOnTargetChange,
    skipTargetChangeAnimation,
  );
  if (targetChangeAction.type === "animate") {
    pendingAnimationRef.current = targetChangeAction.animation;
    prevTargetPxRef.current = targetPx;
  } else if (targetChangeAction.type === "snap") {
    currentPxRef.current = targetChangeAction.position;
    prevTargetPxRef.current = targetPx;
  }

  // Snap when container size changes (resize)
  const resizeSnapPosition = computeContainerResizeSnap(
    containerSize,
    prevContainerSizeRef.current,
    targetPx,
  );
  if (resizeSnapPosition !== null) {
    currentPxRef.current = resizeSnapPosition;
    prevContainerSizeRef.current = containerSize;
  }

  // Animation frame handler
  const handleFrame = React.useCallback(
    ({ easedProgress }: { easedProgress: number }) => {
      const element = elementRef.current;
      const anim = animRef.current;
      if (!element || !anim) {
        return;
      }
      const value = interpolate(anim.from, anim.to, easedProgress);
      currentPxRef.current = value;
      element.style.transform = `${getTransformFn(axis)}(${value}px)`;
    },
    [axis, elementRef],
  );

  const handleComplete = React.useCallback(() => {
    animRef.current = null;
    currentPxRef.current = targetPx;
    prevTargetPxRef.current = targetPx;
  }, [targetPx]);

  const { isAnimating, start, cancel } = useAnimationFrame({
    duration: animationDuration,
    easing: easings.easeOutExpo,
    onFrame: handleFrame,
    onComplete: handleComplete,
  });

  // When swipe ends or target changes with animateOnTargetChange, animate to target
  React.useLayoutEffect(() => {
    if (isOperating) {
      cancel();
      animRef.current = null;
      pendingAnimationRef.current = null;
      return;
    }

    // Check for pending animation (from target change or initial mount)
    if (pendingAnimationRef.current) {
      const pending = pendingAnimationRef.current;
      animRef.current = pending;
      pendingAnimationRef.current = null;
      // Set initial position before animation starts
      const element = elementRef.current;
      if (element) {
        element.style.transform = `${getTransformFn(axis)}(${pending.from}px)`;
      }
      start();
      return;
    }

    const currentPx = currentPxRef.current;
    const distance = Math.abs(currentPx - targetPx);

    if (distance > 1) {
      // Need to animate from current to target
      animRef.current = { from: currentPx, to: targetPx };
      start();
    } else {
      // Close enough, snap directly
      currentPxRef.current = targetPx;
      prevTargetPxRef.current = targetPx;
    }
  }, [isOperating, targetPx, start, cancel]);

  // Direct DOM update during swipe
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    // Skip if animation is running, about to start, or pending
    if (isAnimating) {
      return;
    }
    if (animRef.current !== null) {
      return;
    }
    if (pendingAnimationRef.current !== null) {
      return;
    }

    const displayPx = targetPx + displacement;
    currentPxRef.current = displayPx;
    element.style.transform = `${getTransformFn(axis)}(${displayPx}px)`;
  }, [targetPx, displacement, axis, isAnimating, elementRef]);

  return {
    isAnimating,
    currentPx: currentPxRef.current,
    animationDirection: animRef.current,
  };
}
