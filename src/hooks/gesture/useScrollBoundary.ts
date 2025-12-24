/**
 * @file Hook for detecting scroll position relative to boundaries.
 *
 * Detects whether the scroll position is at the start or end boundary,
 * which is useful for enabling swipe gestures when content is scrolled to an edge.
 */
import * as React from "react";
import type {
  GestureAxis,
  UseScrollBoundaryOptions,
  UseScrollBoundaryResult,
} from "./types.js";

const DEFAULT_TOLERANCE = 1;

/**
 * Gets the scroll position for a given axis.
 */
const getScrollPosition = (element: HTMLElement | null, axis: GestureAxis): number => {
  if (!element) {
    return 0;
  }
  return axis === "horizontal" ? element.scrollLeft : element.scrollTop;
};

/**
 * Gets the maximum scroll position for a given axis.
 */
const getMaxScrollPosition = (element: HTMLElement | null, axis: GestureAxis): number => {
  if (!element) {
    return 0;
  }
  if (axis === "horizontal") {
    return element.scrollWidth - element.clientWidth;
  }
  return element.scrollHeight - element.clientHeight;
};

/**
 * Hook for detecting scroll position relative to boundaries.
 *
 * Monitors the scroll position of an element and reports whether it is
 * at the start boundary (top/left) or end boundary (bottom/right).
 * This is useful for enabling swipe gestures when content is scrolled to an edge.
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { atStart, atEnd } = useScrollBoundary({
 *   containerRef,
 *   axis: "horizontal",
 *   tolerance: 5,
 * });
 *
 * // Enable swipe when at edge
 * const canSwipeLeft = atStart;
 * const canSwipeRight = atEnd;
 * ```
 */
export function useScrollBoundary(options: UseScrollBoundaryOptions): UseScrollBoundaryResult {
  const { containerRef, axis, tolerance = DEFAULT_TOLERANCE } = options;

  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [maxScrollPosition, setMaxScrollPosition] = React.useState(0);

  // Update scroll state
  const updateScrollState = React.useCallback(() => {
    const element = containerRef.current;
    setScrollPosition(getScrollPosition(element, axis));
    setMaxScrollPosition(getMaxScrollPosition(element, axis));
  }, [containerRef, axis]);

  // Initial measurement and scroll event listener
  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    // Initial measurement
    updateScrollState();

    // Listen for scroll events
    const handleScroll = () => {
      updateScrollState();
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    // Also update on resize (content might change)
    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [containerRef, updateScrollState]);

  // Calculate boundary states
  // Handle iOS Safari negative scrollTop (bounce effect)
  const atStart = scrollPosition <= tolerance;
  const atEnd = maxScrollPosition > 0 && scrollPosition >= maxScrollPosition - tolerance;

  return {
    atStart,
    atEnd,
    scrollPosition,
    maxScrollPosition,
  };
}
