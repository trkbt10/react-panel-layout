/**
 * @file Utility for scaling SwipeInputState between containers of different sizes.
 *
 * This enables synchronized swipe behavior between containers with different widths,
 * such as a narrow tab bar and a wide content area moving together proportionally.
 */
import type { SwipeInputState } from "../../hooks/gesture/types.js";

/**
 * Scale SwipeInputState displacement and velocity proportionally for different container sizes.
 *
 * When swiping in a container of one size, this function transforms the input state
 * to appear as if the swipe occurred in a container of a different size.
 * This allows tabs and content to move in sync despite different widths.
 *
 * @param inputState - The original swipe input state
 * @param sourceWidth - Width of the source container (where the swipe originated)
 * @param targetWidth - Width of the target container (where the scaled state will be applied)
 * @returns Scaled SwipeInputState with proportionally adjusted displacement and velocity
 *
 * @example
 * ```tsx
 * // Content area is 400px wide, each tab is 80px wide (5 tabs)
 * const contentWidth = 400;
 * const tabWidth = 80;
 *
 * // Swipe happens on content area
 * const { inputState } = usePivotSwipeInput({ containerRef, pivot, axis: "horizontal" });
 *
 * // Scale for tabs: 100px content swipe → 20px tab movement
 * const tabInputState = scaleInputState(inputState, contentWidth, tabWidth);
 *
 * // Apply to tabs and content respectively
 * <SwipePivotContent inputState={tabInputState} containerSize={tabWidth} />
 * <SwipePivotContent inputState={inputState} containerSize={contentWidth} />
 * ```
 */
export const scaleInputState = (
  inputState: SwipeInputState,
  sourceWidth: number,
  targetWidth: number,
): SwipeInputState => {
  // Guard against invalid dimensions
  if (sourceWidth <= 0 || targetWidth <= 0) {
    return inputState;
  }

  // Idle state needs no scaling
  if (inputState.phase === "idle") {
    return inputState;
  }

  const scale = targetWidth / sourceWidth;

  return {
    ...inputState,
    displacement: {
      x: inputState.displacement.x * scale,
      y: inputState.displacement.y * scale,
    },
    velocity: {
      x: inputState.velocity.x * scale,
      y: inputState.velocity.y * scale,
    },
  };
};
