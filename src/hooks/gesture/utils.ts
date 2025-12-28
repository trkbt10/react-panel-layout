/**
 * @file Utility functions for gesture detection hooks.
 *
 * Contains shared calculations and helper functions used across
 * gesture-related hooks to avoid code duplication.
 */
import type * as React from "react";

/**
 * Calculate velocity from displacement and time elapsed.
 *
 * @param displacement - Distance traveled in pixels
 * @param startTime - Start timestamp in milliseconds
 * @param currentTime - Current timestamp in milliseconds
 * @returns Velocity in pixels per millisecond
 */
export const calculateVelocity = (
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
 *
 * @param displacement - Distance from start position
 * @returns -1 for backward (left/up), 0 for no movement, 1 for forward (right/down)
 */
export const determineDirection = (displacement: number): -1 | 0 | 1 => {
  if (displacement > 0) {
    return 1;
  }
  if (displacement < 0) {
    return -1;
  }
  return 0;
};

/**
 * Container props type for gesture handling.
 */
export type GestureContainerProps = React.HTMLAttributes<HTMLElement> & {
  style: React.CSSProperties;
};

/**
 * Merge multiple container props objects for gesture handling.
 *
 * Combines style objects and chains onPointerDown handlers.
 * Useful when combining multiple gesture hooks that each provide
 * their own container props (e.g., swipe input + native gesture guard).
 *
 * @param propsArray - Array of container props to merge
 * @returns Merged container props with combined styles and handlers
 */
export const mergeGestureContainerProps = (
  ...propsArray: GestureContainerProps[]
): GestureContainerProps => {
  const mergedStyle: React.CSSProperties = {};
  const pointerDownHandlers: Array<
    ((event: React.PointerEvent<HTMLElement>) => void) | undefined
  > = [];

  for (const props of propsArray) {
    Object.assign(mergedStyle, props.style);
    if (props.onPointerDown) {
      pointerDownHandlers.push(props.onPointerDown);
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    for (const handler of pointerDownHandlers) {
      handler?.(event);
    }
  };

  return {
    onPointerDown: handlePointerDown,
    style: mergedStyle,
  };
};

// ============================================================================
// Scroll Detection Utilities
// ============================================================================

/**
 * Check if an element is scrollable in any direction.
 */
export function isScrollableElement(element: HTMLElement): boolean {
  const style = getComputedStyle(element);

  const isScrollableX =
    (style.overflowX === "scroll" || style.overflowX === "auto") &&
    element.scrollWidth > element.clientWidth;

  const isScrollableY =
    (style.overflowY === "scroll" || style.overflowY === "auto") &&
    element.scrollHeight > element.clientHeight;

  return isScrollableX || isScrollableY;
}

/**
 * Check if we should start drag based on scroll state.
 * Returns false if the target is inside a scrollable element.
 */
export function shouldStartDrag(
  event: React.PointerEvent,
  container: HTMLElement,
): boolean {
  // eslint-disable-next-line no-restricted-syntax -- loop variable requires let
  let current = event.target as HTMLElement | null;

  while (current !== null && current !== container) {
    if (isScrollableElement(current)) {
      return false;
    }
    current = current.parentElement;
  }

  return true;
}

/**
 * Check if an element or its ancestors are scrollable in the specified direction.
 * Returns true if scrolling is possible and would block the swipe gesture.
 *
 * @param element - The target element to check
 * @param container - The container boundary
 * @param axis - The axis to check ("x" or "y")
 * @param direction - The swipe direction (1 = right/down, -1 = left/up)
 */
export function isScrollableInDirection(
  element: HTMLElement,
  container: HTMLElement,
  axis: "x" | "y",
  direction: 1 | -1,
): boolean {
  // eslint-disable-next-line no-restricted-syntax -- loop variable requires let
  let current: HTMLElement | null = element;

  while (current !== null && current !== container) {
    const style = getComputedStyle(current);
    const isHorizontal = axis === "x";

    const overflow = isHorizontal ? style.overflowX : style.overflowY;
    const isScrollable = overflow === "scroll" || overflow === "auto";

    if (isScrollable) {
      const scrollSize = isHorizontal
        ? current.scrollWidth - current.clientWidth
        : current.scrollHeight - current.clientHeight;

      if (scrollSize > 0) {
        const scrollPos = isHorizontal ? current.scrollLeft : current.scrollTop;

        // If swiping in close direction and not at boundary, block swipe
        if (direction === -1 && scrollPos > 1) {
          return true; // Can scroll left/up, block swipe
        }
        if (direction === 1 && scrollPos < scrollSize - 1) {
          return true; // Can scroll right/down, block swipe
        }
      }
    }

    current = current.parentElement;
  }

  return false;
}
