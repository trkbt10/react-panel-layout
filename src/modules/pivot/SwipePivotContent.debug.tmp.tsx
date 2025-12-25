/**
 * @file Debug version of SwipePivotContent to investigate iOS swipe issue
 *
 * Issue: On iOS, when swiping pages, the next page sticks to the current position.
 *
 * Hypotheses to test:
 * 1. currentPxRef initialization issue when position/containerSize changes
 * 2. isAnimating timing issue (setIsAnimating is async)
 * 3. useLayoutEffect execution order issue
 * 4. pointercancel handling on iOS
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

// Debug logging
const DEBUG = true;
const log = (id: string, ...args: unknown[]) => {
  if (DEBUG) {
    console.log(`[SwipePivotContent:${id}]`, ...args);
  }
};

export const SwipePivotContentDebug: React.FC<SwipePivotContentProps> = React.memo(({
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

  // BUG HYPOTHESIS 1: currentPxRef is only initialized once at mount
  // If position or containerSize changes, this won't be updated
  const currentPxRef = React.useRef<number>(position * containerSize);
  const animRef = React.useRef<{ from: number; to: number } | null>(null);

  // Track previous values for debugging
  const prevPositionRef = React.useRef(position);
  const prevContainerSizeRef = React.useRef(containerSize);

  const targetPx = position * containerSize;
  const displacement = getDisplacement(inputState, axis);
  const isSwiping = inputState.phase === "swiping" || inputState.phase === "tracking";

  // Debug: Log when position or containerSize changes
  React.useEffect(() => {
    if (prevPositionRef.current !== position) {
      log(id, "position changed:", prevPositionRef.current, "->", position);
      log(id, "  currentPxRef.current:", currentPxRef.current);
      log(id, "  new targetPx:", targetPx);
      prevPositionRef.current = position;
    }
    if (prevContainerSizeRef.current !== containerSize) {
      log(id, "containerSize changed:", prevContainerSizeRef.current, "->", containerSize);
      prevContainerSizeRef.current = containerSize;
    }
  }, [id, position, containerSize, targetPx]);

  // Debug: Log inputState changes
  React.useEffect(() => {
    log(id, "inputState:", inputState.phase, "direction:", inputState.direction, "displacement:", displacement);
  }, [id, inputState, displacement]);

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
    log(id, "animation complete, targetPx:", targetPx);
    animRef.current = null;
    currentPxRef.current = targetPx;
  }, [id, targetPx]);

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

    log(id, "useLayoutEffect[animation]:", {
      isSwiping,
      currentPx,
      targetPx,
      distance,
      willAnimate: distance > 1,
    });

    if (distance > 1) {
      // Need to animate from current to target
      animRef.current = { from: currentPx, to: targetPx };
      log(id, "starting animation:", animRef.current);
      start();
    }
  }, [id, isSwiping, targetPx, start, cancel]);

  // Direct DOM update
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    if (isAnimating) {
      log(id, "useLayoutEffect[dom]: skipped (isAnimating)");
      return; // Animation handles transform
    }

    const fn = axis === "horizontal" ? "translateX" : "translateY";
    const displayPx = targetPx + displacement;

    log(id, "useLayoutEffect[dom]:", {
      targetPx,
      displacement,
      displayPx,
      prevCurrentPx: currentPxRef.current,
    });

    currentPxRef.current = displayPx;
    element.style.transform = `${fn}(${displayPx}px)`;
  }, [id, targetPx, displacement, axis, isAnimating]);

  // Visibility
  const visible = shouldBeVisible(isActive, position, inputState, canNavigate, isAnimating);

  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.style.visibility = visible ? "visible" : "hidden";
      log(id, "visibility:", visible);
    }
  }, [id, visible]);

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
