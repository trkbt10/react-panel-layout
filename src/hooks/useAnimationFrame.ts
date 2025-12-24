/**
 * @file Generic requestAnimationFrame-based animation hook.
 *
 * Provides a reusable animation loop with easing support.
 * This is the foundation for more specific animation hooks.
 */
import * as React from "react";

/**
 * Easing function type.
 * Takes a progress value (0-1) and returns an eased value (0-1).
 */
export type EasingFunction = (t: number) => number;

/**
 * Built-in easing functions.
 */
export const easings = {
  /** Linear (no easing) */
  linear: (t: number): number => t,

  /** Ease out cubic */
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),

  /** Ease out expo (similar to cubic-bezier(0.22, 1, 0.36, 1)) */
  easeOutExpo: (t: number): number => {
    if (t === 1) {
      return 1;
    }
    return 1 - Math.pow(2, -10 * t);
  },

  /** Ease out quart */
  easeOutQuart: (t: number): number => 1 - Math.pow(1 - t, 4),

  /** Ease in out cubic */
  easeInOutCubic: (t: number): number => {
    if (t < 0.5) {
      return 4 * t * t * t;
    }
    return 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
} as const;

/**
 * Animation state passed to callbacks.
 */
export type AnimationState = {
  /** Raw progress (0-1) */
  progress: number;
  /** Eased progress (0-1) */
  easedProgress: number;
  /** Elapsed time in ms */
  elapsed: number;
  /** Whether animation is complete */
  isComplete: boolean;
};

/**
 * Options for useAnimationFrame hook.
 */
export type UseAnimationFrameOptions = {
  /** Duration of animation in milliseconds */
  duration?: number;
  /** Easing function for the animation */
  easing?: EasingFunction;
  /** Callback called every frame with animation state */
  onFrame?: (state: AnimationState) => void;
  /** Callback when animation completes */
  onComplete?: () => void;
};

/**
 * Result from useAnimationFrame hook.
 */
export type UseAnimationFrameResult = {
  /** Whether animation is currently running */
  isAnimating: boolean;
  /** Start the animation */
  start: () => void;
  /** Cancel the animation */
  cancel: () => void;
};

/** Default animation duration in ms */
const DEFAULT_DURATION = 300;

/**
 * Generic requestAnimationFrame-based animation hook.
 *
 * Provides a reusable animation loop with progress calculation and easing.
 * Use this as a building block for specific animation behaviors.
 *
 * @example
 * ```tsx
 * const { start, isAnimating } = useAnimationFrame({
 *   duration: 300,
 *   easing: easings.easeOutExpo,
 *   onFrame: ({ easedProgress }) => {
 *     const value = fromValue + (toValue - fromValue) * easedProgress;
 *     element.style.transform = `translateX(${value}px)`;
 *   },
 *   onComplete: () => console.log('Done!'),
 * });
 *
 * // Start animation
 * start();
 * ```
 */
export function useAnimationFrame(options: UseAnimationFrameOptions): UseAnimationFrameResult {
  const {
    duration = DEFAULT_DURATION,
    easing = easings.easeOutExpo,
    onFrame,
    onComplete,
  } = options;

  const [isAnimating, setIsAnimating] = React.useState(false);
  const rafIdRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);

  // Use refs for callbacks to avoid stale closures
  const onFrameRef = React.useRef(onFrame);
  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => {
    onFrameRef.current = onFrame;
    onCompleteRef.current = onComplete;
  }, [onFrame, onComplete]);

  const cancel = React.useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    startTimeRef.current = null;
    setIsAnimating(false);
  }, []);

  const start = React.useCallback(() => {
    // Cancel any existing animation
    cancel();

    setIsAnimating(true);
    startTimeRef.current = null;

    const step = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const isComplete = progress >= 1;

      const state: AnimationState = {
        progress,
        easedProgress,
        elapsed,
        isComplete,
      };

      onFrameRef.current?.(state);

      if (!isComplete) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        // Animation complete
        rafIdRef.current = null;
        startTimeRef.current = null;
        setIsAnimating(false);
        onCompleteRef.current?.();
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  }, [duration, easing, cancel]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    start,
    cancel,
  };
}

/**
 * Interpolate between two values using eased progress.
 */
export function interpolate(from: number, to: number, easedProgress: number): number {
  return from + (to - from) * easedProgress;
}
