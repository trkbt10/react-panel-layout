/**
 * @file SwipePivotContent component for pivot items with swipe animation.
 *
 * Simple concept:
 * - Each content always animates toward its target position (position * containerSize)
 * - During swipe: displacement is added as offset, content follows finger
 * - After swipe: animate from current position to target
 */
import * as React from "react";
import { useAnimationFrame, interpolate, easings } from "../../hooks/useAnimationFrame.js";
import type { SwipeInputState, GestureAxis } from "../../hooks/gesture/types.js";

const DEFAULT_ANIMATION_DURATION = 300;

export type SwipePivotContentProps = {
  id: string;
  isActive: boolean;
  position: -1 | 0 | 1;
  inputState: SwipeInputState;
  axis?: GestureAxis;
  containerSize: number;
  children: React.ReactNode;
  canNavigate?: boolean;
  animationDuration?: number;
};

const baseStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

const getDisplacement = (inputState: SwipeInputState, axis: GestureAxis): number => {
  if (inputState.phase === "idle") {
    return 0;
  }
  return axis === "horizontal" ? inputState.displacement.x : inputState.displacement.y;
};

const shouldBeVisible = (
  isActive: boolean,
  position: -1 | 0 | 1,
  inputState: SwipeInputState,
  canNavigate: boolean,
  isAnimating: boolean,
): boolean => {
  if (isActive) {
    return true;
  }
  if (isAnimating) {
    return true;
  }
  if (!canNavigate) {
    return false;
  }
  if (inputState.phase === "idle") {
    return false;
  }
  // Show adjacent content based on swipe direction
  if (position === -1 && inputState.direction === 1) {
    return true;
  }
  if (position === 1 && inputState.direction === -1) {
    return true;
  }
  return false;
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
}) => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const currentPxRef = React.useRef<number>(position * containerSize);
  const animRef = React.useRef<{ from: number; to: number } | null>(null);

  const targetPx = position * containerSize;
  const displacement = getDisplacement(inputState, axis);
  const isSwiping = inputState.phase === "swiping" || inputState.phase === "tracking";

  // Animation frame handler
  const handleFrame = React.useCallback(
    ({ easedProgress }: { easedProgress: number }) => {
      const element = elementRef.current;
      const anim = animRef.current;
      if (!element || !anim) {
        return;
      }
      const value = interpolate(anim.from, anim.to, easedProgress);
      currentPxRef.current = value;
      const fn = axis === "horizontal" ? "translateX" : "translateY";
      element.style.transform = `${fn}(${value}px)`;
    },
    [axis],
  );

  const handleComplete = React.useCallback(() => {
    animRef.current = null;
    currentPxRef.current = targetPx;
  }, [targetPx]);

  const { isAnimating, start, cancel } = useAnimationFrame({
    duration: animationDuration,
    easing: easings.easeOutExpo,
    onFrame: handleFrame,
    onComplete: handleComplete,
  });

  // When swipe ends, animate to target
  React.useLayoutEffect(() => {
    // If swiping, don't start animation
    if (isSwiping) {
      cancel();
      return;
    }

    // Check if we need to animate
    const currentPx = currentPxRef.current;
    const distance = Math.abs(currentPx - targetPx);

    if (distance > 1) {
      // Need to animate from current to target
      animRef.current = { from: currentPx, to: targetPx };
      start();
    }
  }, [isSwiping, targetPx, start, cancel]);

  // Direct DOM update
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    if (isAnimating) {
      return; // Animation handles transform
    }

    const fn = axis === "horizontal" ? "translateX" : "translateY";
    const displayPx = targetPx + displacement;
    currentPxRef.current = displayPx;
    element.style.transform = `${fn}(${displayPx}px)`;
  }, [targetPx, displacement, axis, isAnimating]);

  // Visibility
  const visible = shouldBeVisible(isActive, position, inputState, canNavigate, isAnimating);

  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.style.visibility = visible ? "visible" : "hidden";
    }
  }, [visible]);

  const staticStyle = React.useMemo<React.CSSProperties>(() => ({
    ...baseStyle,
    pointerEvents: isActive ? "auto" : "none",
    willChange: "transform",
  }), [isActive]);

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
