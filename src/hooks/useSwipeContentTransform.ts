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
  isSwiping: boolean;
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
 *   isSwiping: inputState.phase === "swiping",
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
    isSwiping,
    axis = "horizontal",
    animationDuration = DEFAULT_ANIMATION_DURATION,
    containerSize,
    animateOnTargetChange = false,
    initialPx,
  } = options;

  // Use initialPx if provided, otherwise use targetPx
  const effectiveInitialPx = initialPx ?? targetPx;
  const currentPxRef = React.useRef<number>(effectiveInitialPx);
  const animRef = React.useRef<{ from: number; to: number } | null>(null);
  const prevTargetPxRef = React.useRef<number>(targetPx);
  const prevContainerSizeRef = React.useRef<number | undefined>(containerSize);
  const pendingAnimationRef = React.useRef<{ from: number; to: number } | null>(null);
  const isFirstMountRef = React.useRef<boolean>(true);

  // Schedule animation on first mount if initialPx differs from targetPx
  if (isFirstMountRef.current && initialPx !== undefined && initialPx !== targetPx) {
    pendingAnimationRef.current = { from: initialPx, to: targetPx };
    isFirstMountRef.current = false;
  } else if (isFirstMountRef.current) {
    isFirstMountRef.current = false;
  }

  // Handle target changes when not swiping
  if (targetPx !== prevTargetPxRef.current && !isSwiping && animRef.current === null) {
    if (animateOnTargetChange) {
      // Schedule animation from current position to new target
      const distance = Math.abs(currentPxRef.current - targetPx);
      if (distance > 1) {
        pendingAnimationRef.current = { from: currentPxRef.current, to: targetPx };
      } else {
        currentPxRef.current = targetPx;
      }
    } else {
      // Snap immediately (default behavior for resize, etc.)
      currentPxRef.current = targetPx;
    }
    prevTargetPxRef.current = targetPx;
  }

  // Snap when container size changes (resize)
  if (containerSize !== undefined && containerSize !== prevContainerSizeRef.current && containerSize > 0) {
    currentPxRef.current = targetPx;
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
    if (isSwiping) {
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
  }, [isSwiping, targetPx, start, cancel]);

  // Direct DOM update during swipe
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    // Skip if animation is running, about to start, or pending
    if (isAnimating || animRef.current !== null || pendingAnimationRef.current !== null) {
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
