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
import { computeStackContentState } from "./computeStackContentState.js";
import type { StackAnimationType } from "./computeStackContentState.js";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect.js";

const baseStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
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

  // Track current animation type
  const [animationType, setAnimationType] = React.useState<StackAnimationType>(null);

  // Compute state using pure function
  const computedState = computeStackContentState({
    depth,
    isActive,
    wasActive: prevActiveRef.current,
    currentAnimationType: animationType,
    displayMode,
    transitionMode,
    navigationState,
    swipeProgress,
  });

  // Update animation type synchronously before paint
  useIsomorphicLayoutEffect(() => {
    const wasActive = prevActiveRef.current;
    prevActiveRef.current = isActive;

    if (wasActive !== isActive) {
      setAnimationType(computedState.nextAnimationType);
    }
  }, [isActive, computedState.nextAnimationType]);

  // Clear animation type after animation ends
  // Only handle animation end for this element (not bubbled from children)
  const handleAnimationEnd = React.useCallback((e: React.AnimationEvent) => {
    if (e.target === e.currentTarget) {
      setAnimationType(null);
    }
  }, []);

  // Build style from computed state
  const style = React.useMemo<React.CSSProperties>(() => {
    const s: React.CSSProperties = {
      ...baseStyle,
      transform: computedState.transform,
      pointerEvents: computedState.pointerEvents,
      zIndex: computedState.zIndex,
      visibility: computedState.visibility,
    };

    if (computedState.animation !== undefined) {
      s.animation = computedState.animation;
    }

    if (computedState.transition !== undefined) {
      s.transition = computedState.transition;
    }

    return s;
  }, [computedState]);

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
