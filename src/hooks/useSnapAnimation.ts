/**
 * @file Hook for snapping element transform animation.
 *
 * Built on top of useAnimationFrame, provides a convenient API
 * for animating element transforms from one position to another.
 */
import * as React from "react";
import { useAnimationFrame, interpolate, easings } from "./useAnimationFrame.js";
import type { EasingFunction } from "./useAnimationFrame.js";

// Re-export easings for convenience
export { easings } from "./useAnimationFrame.js";
export type { EasingFunction } from "./useAnimationFrame.js";

/**
 * Options for useSnapAnimation hook.
 */
export type UseSnapAnimationOptions = {
  /** Reference to the element to animate */
  elementRef: React.RefObject<HTMLElement | null>;
  /** Duration of animation in milliseconds */
  duration?: number;
  /** Easing function for the animation */
  easing?: EasingFunction;
  /** Callback when animation completes */
  onComplete?: () => void;
};

/**
 * Result from useSnapAnimation hook.
 */
export type UseSnapAnimationResult = {
  /** Whether animation is currently running */
  isAnimating: boolean;
  /** Start a new animation from current value to target */
  animate: (from: number, to: number, axis: "x" | "y") => void;
  /** Cancel any running animation */
  cancel: () => void;
};

/** Default animation duration in ms */
const DEFAULT_DURATION = 300;

/**
 * Hook for snapping element transform animation.
 *
 * Animates an element's transform from one position to another
 * using requestAnimationFrame for smooth animation.
 *
 * @example
 * ```tsx
 * const elementRef = useRef<HTMLDivElement>(null);
 * const { animate, isAnimating } = useSnapAnimation({
 *   elementRef,
 *   duration: 300,
 *   easing: easings.easeOutExpo,
 * });
 *
 * // Start animation
 * animate(currentX, targetX, "x");
 * ```
 */
export function useSnapAnimation(options: UseSnapAnimationOptions): UseSnapAnimationResult {
  const {
    elementRef,
    duration = DEFAULT_DURATION,
    easing = easings.easeOutExpo,
    onComplete,
  } = options;

  // Store animation parameters in refs for use in onFrame callback
  const animParamsRef = React.useRef<{
    from: number;
    to: number;
    axis: "x" | "y";
  } | null>(null);

  const handleFrame = React.useCallback(
    ({ easedProgress }: { easedProgress: number }) => {
      const element = elementRef.current;
      const params = animParamsRef.current;
      if (!element || !params) {
        return;
      }

      const currentValue = interpolate(params.from, params.to, easedProgress);
      const translateFn = params.axis === "x" ? "translateX" : "translateY";
      element.style.transform = `${translateFn}(${currentValue}px)`;
    },
    [elementRef],
  );

  const { isAnimating, start, cancel } = useAnimationFrame({
    duration,
    easing,
    onFrame: handleFrame,
    onComplete,
  });

  const animate = React.useCallback(
    (from: number, to: number, axis: "x" | "y") => {
      const element = elementRef.current;
      if (!element) {
        return;
      }

      // If from and to are the same, no animation needed
      if (Math.abs(from - to) < 0.5) {
        const translateFn = axis === "x" ? "translateX" : "translateY";
        element.style.transform = `${translateFn}(${to}px)`;
        return;
      }

      // Store animation parameters
      animParamsRef.current = { from, to, axis };

      // Start animation
      start();
    },
    [elementRef, start],
  );

  return {
    isAnimating,
    animate,
    cancel,
  };
}
