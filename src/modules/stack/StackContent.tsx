/**
 * @file StackContent component for rendering stack panels with animations.
 *
 * Override via CSS custom properties:
 * - --rpl-stack-animation-push: Animation when panel is pushed
 * - --rpl-stack-animation-pop: Animation when panel is popped
 * - --rpl-stack-transition-duration: Duration of transitions
 * - --rpl-stack-transition-easing: Easing for transitions
 */
import * as React from "react";
import type { StackContentProps } from "./types.js";
import {
  STACK_ANIMATION_PUSH,
  STACK_ANIMATION_POP,
  STACK_TRANSITION_DURATION,
  STACK_TRANSITION_EASING,
} from "../../constants/styles.js";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect.js";

const baseStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

/**
 * Calculate transform based on display mode and panel position.
 */
const calculateTransform = (
  depth: number,
  activeDepth: number,
  displayMode: StackContentProps["displayMode"],
  isRevealing: boolean,
  revealDepth: number | null,
): string => {
  const isActive = depth === activeDepth;
  const isPrevious = depth < activeDepth;

  // During reveal, shift active panel to show parent
  if (isRevealing && isActive && revealDepth !== null) {
    const revealProgress = 0.3; // Show parent peeking behind
    return `translateX(${revealProgress * 100}%)`;
  }

  if (isActive) {
    return "translateX(0)";
  }

  if (isPrevious) {
    switch (displayMode) {
      case "overlay":
        // Previous panels are hidden behind
        return "translateX(0)";
      case "slide":
        // Previous panels slide to the left
        return "translateX(-30%)";
      case "stack":
        // Previous panels stack with offset
        const offset = (activeDepth - depth) * -5;
        return `translateX(${offset}%) scale(${1 - (activeDepth - depth) * 0.05})`;
    }
  }

  // Future panels (not in stack) stay off-screen
  return "translateX(100%)";
};

/**
 * Renders a stack panel with appropriate animation based on display mode.
 */
export const StackContent: React.FC<StackContentProps> = React.memo(({
  id,
  depth,
  isActive,
  displayMode,
  transitionMode,
  navigationState,
  swipeProgress,
  children,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const prevActiveRef = React.useRef(isActive);

  // Track if this is a push or pop animation
  const [animationType, setAnimationType] = React.useState<"push" | "pop" | null>(null);

  // Use useLayoutEffect to set animation type before paint, preventing flicker
  useIsomorphicLayoutEffect(() => {
    if (transitionMode !== "css") {
      return;
    }

    const wasActive = prevActiveRef.current;
    prevActiveRef.current = isActive;

    if (wasActive !== isActive) {
      // Determine animation type based on state change
      setAnimationType(isActive ? "push" : "pop");
    }
  }, [isActive, transitionMode]);

  // Clear animation type after animation ends
  const handleAnimationEnd = React.useCallback(() => {
    setAnimationType(null);
  }, []);

  const transform = calculateTransform(
    depth,
    navigationState.depth,
    displayMode,
    navigationState.isRevealing,
    navigationState.revealDepth,
  );

  const style = React.useMemo<React.CSSProperties>(() => {
    const s: React.CSSProperties = {
      ...baseStyle,
      transform,
      pointerEvents: isActive ? "auto" : "none",
      zIndex: depth,
    };

    // Apply visibility based on display mode
    // Important: Keep panel visible during pop animation
    const isAnimatingOut = animationType === "pop";

    if (displayMode === "overlay") {
      // In overlay mode, only show active and previous panel (for reveal)
      // Also keep visible during pop animation
      const shouldShow = isActive ||
        isAnimatingOut ||
        (navigationState.isRevealing && depth === navigationState.revealDepth);
      s.visibility = shouldShow ? "visible" : "hidden";
    } else {
      // In slide/stack mode, show all panels in stack
      // Also keep visible during pop animation
      s.visibility = (depth <= navigationState.depth || isAnimatingOut) ? "visible" : "hidden";
    }

    // Apply animations for CSS mode
    if (transitionMode === "css") {
      if (animationType === "push") {
        s.animation = STACK_ANIMATION_PUSH;
      } else if (animationType === "pop") {
        s.animation = STACK_ANIMATION_POP;
      }

      // Apply transition for transform changes
      s.transition = `transform ${STACK_TRANSITION_DURATION} ${STACK_TRANSITION_EASING}`;
    }

    // Apply swipe progress if provided
    if (swipeProgress !== undefined && swipeProgress > 0) {
      const swipeOffset = swipeProgress * 100;
      if (isActive) {
        s.transform = `translateX(${swipeOffset}%)`;
      }
    }

    return s;
  }, [
    transform,
    isActive,
    depth,
    displayMode,
    transitionMode,
    animationType,
    navigationState.isRevealing,
    navigationState.revealDepth,
    navigationState.depth,
    swipeProgress,
  ]);

  const content = (
    <div
      ref={ref}
      data-stack-content={id}
      data-depth={depth}
      data-active={isActive ? "true" : "false"}
      style={style}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );

  if (transitionMode === "none") {
    return <React.Activity mode={isActive ? "visible" : "hidden"}>{content}</React.Activity>;
  }

  return content;
});
