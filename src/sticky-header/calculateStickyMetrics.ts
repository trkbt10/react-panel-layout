/**
 * @file Pure function for calculating sticky area metrics.
 *
 * Extracts the position-dependent calculation logic from StickyArea component
 * to enable unit testing and reduce code duplication.
 */
import type { StickyAreaPosition } from "./types";

/** Output metrics for sticky area layout. */
export type StickyMetrics = {
  coverAreaHeight: number;
  isStuck: boolean;
  scrollOffset: number;
};

/** Lightweight element bounding rect used for calculations. */
export type ElementRect = {
  top: number;
  bottom: number;
  height: number;
};

/**
 * Calculate sticky area metrics based on element position and viewport.
 *
 * @param position - Whether the sticky area is at "top" or "bottom"
 * @param rect - Element bounding rect (top, bottom, height)
 * @param viewportHeight - Current viewport height
 * @returns Calculated metrics for cover area height, stuck state, and scroll offset
 */
export function calculateStickyMetrics(
  position: StickyAreaPosition,
  rect: ElementRect,
  viewportHeight: number
): StickyMetrics {
  if (position === "top") {
    return {
      coverAreaHeight: Math.max(0, rect.height + rect.top),
      isStuck: rect.top < 0,
      scrollOffset: Math.max(0, -rect.top),
    };
  }
  // bottom
  const distanceFromBottom = viewportHeight - rect.bottom;
  return {
    coverAreaHeight: Math.max(0, rect.height + distanceFromBottom),
    isStuck: rect.bottom > viewportHeight,
    scrollOffset: Math.max(0, rect.bottom - viewportHeight),
  };
}
