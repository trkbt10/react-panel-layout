/**
 * @file Pure functions for computing StackContent state.
 *
 * Separates state computation logic from React/CSS concerns for testability.
 * All functions are pure and deterministic.
 */
import {
  STACK_ANIMATION_PUSH,
  STACK_ANIMATION_POP,
  STACK_TRANSITION_DURATION,
  STACK_TRANSITION_EASING,
} from "../../constants/styles.js";

/**
 * Animation type for stack panel transitions.
 */
export type StackAnimationType = "push" | "pop" | null;

/**
 * Display mode for stack panels.
 */
export type StackDisplayMode = "overlay" | "slide" | "stack";

/**
 * Transition mode for animations.
 */
export type StackTransitionMode = "css" | "none";

/**
 * Input for computing animation type.
 */
export type ComputeAnimationTypeInput = {
  wasActive: boolean;
  isActive: boolean;
  transitionMode: StackTransitionMode;
};

/**
 * Compute the animation type based on active state change.
 *
 * @returns The animation type to apply, or null if no animation needed.
 */
export function computeAnimationType(input: ComputeAnimationTypeInput): StackAnimationType {
  const { wasActive, isActive, transitionMode } = input;

  if (transitionMode !== "css") {
    return null;
  }

  if (wasActive === isActive) {
    return null;
  }

  return isActive ? "push" : "pop";
}

/**
 * Input for computing visibility.
 */
export type ComputeVisibilityInput = {
  displayMode: StackDisplayMode;
  depth: number;
  navigationDepth: number;
  isActive: boolean;
  isAnimatingOut: boolean;
  isRevealing: boolean;
  revealDepth: number | null;
};

/**
 * Compute panel visibility based on display mode and state.
 *
 * @returns "visible" or "hidden"
 */
export function computeVisibility(input: ComputeVisibilityInput): "visible" | "hidden" {
  const {
    displayMode,
    depth,
    navigationDepth,
    isActive,
    isAnimatingOut,
    isRevealing,
    revealDepth,
  } = input;

  if (displayMode === "overlay") {
    // In overlay mode, only show active, animating out, or revealing panel
    if (isActive) {
      return "visible";
    }
    if (isAnimatingOut) {
      return "visible";
    }
    if (isRevealing && depth === revealDepth) {
      return "visible";
    }
    return "hidden";
  }

  // In slide/stack mode, show all panels in stack or animating out
  if (depth <= navigationDepth) {
    return "visible";
  }
  if (isAnimatingOut) {
    return "visible";
  }
  return "hidden";
}

/**
 * Input for computing transform.
 */
export type ComputeTransformInput = {
  depth: number;
  activeDepth: number;
  displayMode: StackDisplayMode;
  isRevealing: boolean;
  revealDepth: number | null;
};

/**
 * Compute the transform value for a stack panel.
 *
 * @returns CSS transform string
 */
export function computeTransform(input: ComputeTransformInput): string {
  const { depth, activeDepth, displayMode, isRevealing, revealDepth } = input;

  const isActive = depth === activeDepth;
  const isPrevious = depth < activeDepth;

  // During reveal, shift active panel to show parent
  if (isRevealing && isActive) {
    if (revealDepth !== null) {
      const revealProgress = 0.3;
      return `translateX(${revealProgress * 100}%)`;
    }
  }

  if (isActive) {
    return "translateX(0)";
  }

  if (isPrevious) {
    switch (displayMode) {
      case "overlay":
        return "translateX(0)";
      case "slide":
        return "translateX(-30%)";
      case "stack": {
        const offset = (activeDepth - depth) * -5;
        const scale = 1 - (activeDepth - depth) * 0.05;
        return `translateX(${offset}%) scale(${scale})`;
      }
    }
  }

  // Future panels stay off-screen
  return "translateX(100%)";
}

/**
 * Compute the transform value considering swipe progress.
 */
function computeSwipeTransform(
  baseTransform: string,
  swipeProgress: number | undefined,
  isActive: boolean,
): string {
  if (swipeProgress === undefined) {
    return baseTransform;
  }
  if (swipeProgress <= 0) {
    return baseTransform;
  }
  if (!isActive) {
    return baseTransform;
  }
  return `translateX(${swipeProgress * 100}%)`;
}

/**
 * Compute the transition CSS value.
 */
function computeTransitionCss(transitionMode: StackTransitionMode): string | undefined {
  if (transitionMode !== "css") {
    return undefined;
  }
  return `transform ${STACK_TRANSITION_DURATION} ${STACK_TRANSITION_EASING}`;
}

/**
 * Full input for computing stack content state.
 */
export type StackContentStateInput = {
  depth: number;
  isActive: boolean;
  wasActive: boolean;
  currentAnimationType: StackAnimationType;
  displayMode: StackDisplayMode;
  transitionMode: StackTransitionMode;
  navigationState: {
    depth: number;
    isRevealing: boolean;
    revealDepth: number | null;
  };
  swipeProgress: number | undefined;
};

/**
 * Computed state output for stack content.
 */
export type StackContentStateOutput = {
  nextAnimationType: StackAnimationType;
  visibility: "visible" | "hidden";
  transform: string;
  animation: string | undefined;
  transition: string | undefined;
  zIndex: number;
  pointerEvents: "auto" | "none";
};

/**
 * Compute the complete state for a stack content panel.
 *
 * This is the main entry point that combines all state computation.
 * Pure function with no side effects.
 *
 * @param input - All inputs needed to compute state
 * @returns Computed state for rendering
 */
export function computeStackContentState(input: StackContentStateInput): StackContentStateOutput {
  const {
    depth,
    isActive,
    wasActive,
    currentAnimationType,
    displayMode,
    transitionMode,
    navigationState,
    swipeProgress,
  } = input;

  // 1. Compute animation type
  const stateChangeAnimationType = computeAnimationType({
    wasActive,
    isActive,
    transitionMode,
  });

  // Use new animation type if state changed, otherwise preserve current
  const nextAnimationType = stateChangeAnimationType ?? currentAnimationType;

  // 2. Compute visibility
  const isAnimatingOut = nextAnimationType === "pop";
  const visibility = computeVisibility({
    displayMode,
    depth,
    navigationDepth: navigationState.depth,
    isActive,
    isAnimatingOut,
    isRevealing: navigationState.isRevealing,
    revealDepth: navigationState.revealDepth,
  });

  // 3. Compute transform
  const baseTransform = computeTransform({
    depth,
    activeDepth: navigationState.depth,
    displayMode,
    isRevealing: navigationState.isRevealing,
    revealDepth: navigationState.revealDepth,
  });

  // Apply swipe progress transform if swiping on active panel
  const transform = computeSwipeTransform(baseTransform, swipeProgress, isActive);

  // 4. Compute animation CSS
  const animation = (() => {
    if (transitionMode !== "css") {
      return undefined;
    }
    if (nextAnimationType === "push") {
      return STACK_ANIMATION_PUSH;
    }
    if (nextAnimationType === "pop") {
      return STACK_ANIMATION_POP;
    }
    return undefined;
  })();

  // 5. Compute transition CSS
  const transition = computeTransitionCss(transitionMode);

  return {
    nextAnimationType,
    visibility,
    transform,
    animation,
    transition,
    zIndex: depth,
    pointerEvents: isActive ? "auto" : "none",
  };
}
