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
