/**
 * @file Hook for animation-aware visibility control.
 *
 * Common pattern for showing/hiding elements with CSS animations:
 * - If animation exists: wait for animationend before hiding
 * - If no animation: hide immediately
 * - Uses display:none for performance (removes from layout)
 * - Includes timeout fallback in case animationend doesn't fire
 */
import * as React from "react";

/** Default timeout for animation fallback (ms) */
const DEFAULT_ANIMATION_TIMEOUT = 1000;

type AnimatedVisibilityState = {
  /** Whether element should be displayed (display: block/none) */
  shouldDisplay: boolean;
  /** Whether element is currently animating out */
  isAnimatingOut: boolean;
};

type UseAnimatedVisibilityOptions = {
  /** Whether the element is logically visible */
  isVisible: boolean;
  /** CSS animation value for leave animation (e.g., CSS variable) */
  leaveAnimation?: string;
  /** Skip animation and hide immediately */
  skipAnimation?: boolean;
  /** Timeout for animation fallback in ms (default: 1000ms) */
  animationTimeout?: number;
};

type UseAnimatedVisibilityResult = {
  /** Current visibility state */
  state: AnimatedVisibilityState;
  /** Props to spread on the animated element */
  props: {
    onAnimationEnd: (e: React.AnimationEvent) => void;
  };
  /** Style to apply for display control */
  style: {
    display: "block" | "none";
  };
};

/**
 * Hook for animation-aware visibility control.
 *
 * @example
 * const { state, props, style } = useAnimatedVisibility({
 *   isVisible: isActive,
 *   leaveAnimation: PIVOT_ANIMATION_LEAVE,
 * });
 *
 * return (
 *   <div
 *     style={{ ...baseStyle, ...style, animation: isActive ? enterAnim : leaveAnim }}
 *     {...props}
 *   >
 *     {children}
 *   </div>
 * );
 */
export function useAnimatedVisibility({
  isVisible,
  leaveAnimation,
  skipAnimation = false,
  animationTimeout = DEFAULT_ANIMATION_TIMEOUT,
}: UseAnimatedVisibilityOptions): UseAnimatedVisibilityResult {
  const prevVisibleRef = React.useRef(isVisible);
  const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout on unmount
  const shouldSkipLeaveAnimation = (
    isSkipped: boolean,
    animation: string | undefined,
  ): boolean => {
    if (isSkipped) {
      return true;
    }
    if (!animation) {
      return true;
    }
    if (animation === "none") {
      return true;
    }
    return false;
  };

  const getShouldDisplay = (visible: boolean, animatingOut: boolean): boolean => {
    if (visible) {
      return true;
    }
    if (animatingOut) {
      return true;
    }
    return false;
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const wasVisible = prevVisibleRef.current;
    prevVisibleRef.current = isVisible;

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (wasVisible && !isVisible) {
      // Transitioning from visible to hidden
      if (shouldSkipLeaveAnimation(skipAnimation, leaveAnimation)) {
        // No animation, hide immediately
        setIsAnimatingOut(false);
      } else {
        // Has animation, mark as animating out
        setIsAnimatingOut(true);

        // Set timeout fallback in case animationend doesn't fire
        // (e.g., CSS variable resolves to "none", or animation is very short)
        timeoutRef.current = setTimeout(() => {
          setIsAnimatingOut(false);
        }, animationTimeout);
      }
    } else if (!wasVisible && isVisible) {
      // Transitioning from hidden to visible
      setIsAnimatingOut(false);
    }
  }, [isVisible, leaveAnimation, skipAnimation, animationTimeout]);

  const handleAnimationEnd = React.useCallback(
    (e: React.AnimationEvent) => {
      // Only handle animation end for this element (not bubbled from children)
      if (e.target === e.currentTarget && isAnimatingOut) {
        // Clear timeout since animation completed normally
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setIsAnimatingOut(false);
      }
    },
    [isAnimatingOut],
  );

  // Element should be displayed if:
  // - It's visible, OR
  // - It's animating out (leave animation in progress)
  const shouldDisplay = getShouldDisplay(isVisible, isAnimatingOut);

  return {
    state: {
      shouldDisplay,
      isAnimatingOut,
    },
    props: {
      onAnimationEnd: handleAnimationEnd,
    },
    style: {
      display: shouldDisplay ? "block" : "none",
    },
  };
}
