/**
 * @file Pure functions for computing Stack panel transforms during swipe.
 *
 * These functions calculate positions for iOS-style "swipe to go back" behavior
 * where the active panel follows the finger and the behind panel reveals from -30%.
 */

/**
 * Default offset for behind panel (-30% of container width).
 */
export const DEFAULT_BEHIND_OFFSET = -0.3;

/**
 * Compute the target position for the active panel.
 *
 * Active panel starts at 0 and moves right as the user swipes.
 *
 * @param displacement - Current swipe displacement in pixels
 * @returns Target position in pixels
 */
export function computeActiveTargetPx(displacement: number): number {
  // Active panel follows the finger directly
  // Only move right (positive displacement) for left-edge swipe
  return Math.max(0, displacement);
}

/**
 * Compute the target position for the behind panel.
 *
 * Behind panel starts at -30% and moves to 0% as swipe progresses.
 * Uses parallax effect: moves slower than the active panel.
 *
 * @param displacement - Current swipe displacement in pixels
 * @param containerSize - Container width/height in pixels
 * @param behindOffset - Starting offset ratio (default -0.3 for -30%)
 * @returns Target position in pixels
 */
export function computeBehindTargetPx(
  displacement: number,
  containerSize: number,
  behindOffset: number = DEFAULT_BEHIND_OFFSET,
): number {
  if (containerSize <= 0) {
    return 0;
  }

  // Only respond to positive displacement (swipe right)
  const clampedDisplacement = Math.max(0, displacement);

  // Calculate progress (0 to 1)
  const progress = Math.min(clampedDisplacement / containerSize, 1);

  // Behind panel starts at behindOffset * containerSize and moves to 0
  // Parallax: moves |behindOffset| * progress * containerSize
  const basePosition = behindOffset * containerSize;
  const parallaxOffset = Math.abs(behindOffset) * progress * containerSize;

  return basePosition + parallaxOffset;
}

/**
 * Compute swipe progress as a ratio (0 to 1).
 *
 * @param displacement - Current swipe displacement in pixels
 * @param containerSize - Container width/height in pixels
 * @returns Progress ratio from 0 to 1
 */
export function computeSwipeProgress(displacement: number, containerSize: number): number {
  if (containerSize <= 0) {
    return 0;
  }

  const clampedDisplacement = Math.max(0, displacement);
  return Math.min(clampedDisplacement / containerSize, 1);
}

/**
 * Input for computing swipe visibility.
 */
export type ComputeSwipeVisibilityInput = {
  /** Panel depth in the stack */
  depth: number;
  /** Current navigation depth (active panel) */
  navigationDepth: number;
  /** Whether this panel is currently active */
  isActive: boolean;
  /** Whether swipe gesture is active */
  isOperating: boolean;
  /** Whether snap-back animation is running */
  isAnimating: boolean;
};

/**
 * Compute whether a panel should be visible during swipe.
 *
 * During swipe:
 * - Active panel is always visible
 * - Behind panel (depth = navigationDepth - 1) is visible when swiping/animating
 *
 * @returns true if panel should be visible
 */
export function computeSwipeVisibility(input: ComputeSwipeVisibilityInput): boolean {
  const { depth, navigationDepth, isActive, isOperating, isAnimating } = input;

  // Active panel is always visible
  if (isActive) {
    return true;
  }

  // Behind panel (one level back) is visible during swipe or animation
  const isBehindPanel = depth === navigationDepth - 1;
  if (isBehindPanel) {
    if (isOperating) {
      return true;
    }
    if (isAnimating) {
      return true;
    }
  }

  // Other panels are hidden during swipe
  return false;
}

/**
 * Determine the role of a panel during swipe gesture.
 */
export type SwipePanelRole = "active" | "behind" | "hidden";

/**
 * Determine the role of a panel during swipe.
 *
 * @param depth - Panel depth in the stack
 * @param navigationDepth - Current navigation depth (active panel)
 * @returns Panel role for swipe handling
 */
export function determineSwipePanelRole(depth: number, navigationDepth: number): SwipePanelRole {
  if (depth === navigationDepth) {
    return "active";
  }
  if (depth === navigationDepth - 1) {
    return "behind";
  }
  return "hidden";
}
