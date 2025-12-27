/**
 * @file SwipePivotContent component for pivot items with swipe animation.
 *
 * Positioning model:
 * - targetPx = position * containerSize (where the item should be)
 * - During swipe: displayPx = targetPx + displacement (follows finger)
 * - After swipe: animate currentPx from finger position to targetPx
 *
 * Visibility modes:
 * 1. Adjacent mode (default): Active item + adjacent items during swipe/animation
 * 2. Viewport mode (viewportSize specified): Items visible if within viewport bounds
 *
 * Uses shared useSwipeContentTransform hook for DOM manipulation.
 */
import * as React from "react";
import { useSwipeContentTransform } from "../../hooks/useSwipeContentTransform.js";
import type { AnimationDirection } from "../../hooks/useSwipeContentTransform.js";
import type { SwipeInputState, GestureAxis } from "../../hooks/gesture/types.js";

const DEFAULT_ANIMATION_DURATION = 300;

export type SwipePivotContentProps = {
  id: string;
  isActive: boolean;
  /**
   * Position offset in number of items from center (0).
   * Positive values are to the right/bottom, negative to the left/top.
   */
  position: number;
  inputState: SwipeInputState;
  axis?: GestureAxis;
  /** Size of each item (width for horizontal, height for vertical) */
  containerSize: number;
  children: React.ReactNode;
  canNavigate?: boolean;
  animationDuration?: number;
  /**
   * Viewport size for viewport-based visibility mode.
   * When specified, items are visible if they intersect with the viewport [0, viewportSize].
   * When not specified, uses adjacent-item visibility logic (default).
   */
  viewportSize?: number;
};

const BASE_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

/** Get displacement value for the given axis from input state */
const getAxisDisplacement = (inputState: SwipeInputState, axis: GestureAxis): number => {
  if (inputState.phase === "idle") {
    return 0;
  }
  return axis === "horizontal" ? inputState.displacement.x : inputState.displacement.y;
};

/** Check if animating towards center (position 0) */
const isAnimatingTowardsCenter = (animationDirection: AnimationDirection | null): boolean => {
  if (!animationDirection) {
    return false;
  }
  const { from, to } = animationDirection;
  return Math.abs(to) < Math.abs(from);
};

/** Check if animating away from center (snap-back) */
const isAnimatingAwayFromCenter = (animationDirection: AnimationDirection | null): boolean => {
  if (!animationDirection) {
    return false;
  }
  const { from, to } = animationDirection;
  return Math.abs(to) > Math.abs(from);
};

/** Determine if an item should be visible based on current state (adjacent mode) */
const computeAdjacentVisibility = (
  isActive: boolean,
  position: number,
  inputState: SwipeInputState,
  canNavigate: boolean,
  animationDirection: AnimationDirection | null,
): boolean => {
  if (isActive) {
    return true;
  }
  if (isAnimatingTowardsCenter(animationDirection)) {
    return true;
  }
  // Keep visible during snap-back animation (moving away from center)
  if (isAnimatingAwayFromCenter(animationDirection)) {
    return true;
  }
  if (!canNavigate) {
    return false;
  }
  if (inputState.phase === "idle") {
    return false;
  }
  // Show adjacent item when swiping towards it
  if (position === -1 && inputState.direction === 1) {
    return true;
  }
  if (position === 1 && inputState.direction === -1) {
    return true;
  }
  return false;
};

/**
 * Determine if an item should be visible based on viewport intersection.
 * An item is visible if any part of it intersects with the viewport [0, viewportSize].
 */
const computeViewportVisibility = (
  itemPosition: number,
  containerSize: number,
  viewportSize: number,
): boolean => {
  const itemStart = itemPosition;
  const itemEnd = itemPosition + containerSize;
  // Item is visible if it intersects with [0, viewportSize]
  return itemEnd > 0 && itemStart < viewportSize;
};

export const SwipePivotContent: React.FC<SwipePivotContentProps> = React.memo(({
  id,
  isActive,
  position,
  inputState,
  axis = "horizontal",
  containerSize,
  children,
  canNavigate = true,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  viewportSize,
}) => {
  const elementRef = React.useRef<HTMLDivElement>(null);

  const targetPx = position * containerSize;
  const displacement = getAxisDisplacement(inputState, axis);
  const isOperating = inputState.phase === "swiping" || inputState.phase === "tracking";

  // Use shared transform hook for DOM manipulation
  const { animationDirection } = useSwipeContentTransform({
    elementRef,
    targetPx,
    displacement,
    isOperating,
    axis,
    animationDuration,
    containerSize,
  });

  // Compute visibility based on mode
  const computeVisible = (): boolean => {
    if (viewportSize !== undefined) {
      return computeViewportVisibility(targetPx + displacement, containerSize, viewportSize);
    }
    return computeAdjacentVisibility(isActive, position, inputState, canNavigate, animationDirection);
  };
  const visible = computeVisible();

  // Update visibility via direct DOM manipulation
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.style.visibility = visible ? "visible" : "hidden";
    }
  }, [visible]);

  // Initial transform and visibility to prevent flash of unstyled content
  const transformFn = axis === "horizontal" ? "translateX" : "translateY";
  const initialTransform = `${transformFn}(${targetPx}px)`;
  const initialVisibility = visible ? "visible" : "hidden";

  const staticStyle = React.useMemo<React.CSSProperties>(() => ({
    ...BASE_STYLE,
    pointerEvents: isActive ? "auto" : "none",
    willChange: "transform",
    transform: initialTransform,
    visibility: initialVisibility,
  }), [isActive, initialTransform, initialVisibility]);

  return (
    <div
      ref={elementRef}
      data-pivot-content={id}
      data-active={isActive ? "true" : "false"}
      data-position={position}
      style={staticStyle}
    >
      {children}
    </div>
  );
});
