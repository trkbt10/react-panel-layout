/**
 * @file Dialog animation utilities
 *
 * Provides multi-phase animation calculations and viewTransition support
 * for dialog open/close animations with "suck in" effect.
 */

import { easings } from "../../hooks/useAnimationFrame.js";

/**
 * Direction from which the dialog opens.
 * The close animation uses the opposite direction.
 */
export type DialogOpenDirection = "center" | "top" | "bottom" | "left" | "right";

/**
 * Phase transition point for multi-phase animation.
 * Phase 1: 0 to PHASE_TRANSITION (translate movement)
 * Phase 2: PHASE_TRANSITION to 1 (scale + accelerated translate)
 */
const PHASE_TRANSITION = 0.7;

/**
 * Final scale value for "suck in" effect.
 */
const FINAL_SCALE = 0.85;

/**
 * Transform values for dialog animation.
 */
export type DialogTransform = {
  /** Translate value in pixels (x or y depending on direction) */
  translate: number;
  /** Scale value (1 = normal, 0.85 = final suck-in) */
  scale: number;
  /** Backdrop opacity (1 = fully visible, 0 = transparent) */
  backdropOpacity: number;
};

/**
 * Axis for the dialog animation based on direction.
 */
export type DialogAnimationAxis = "x" | "y";

/**
 * Get the animation axis for a given direction.
 */
export function getAnimationAxis(direction: DialogOpenDirection): DialogAnimationAxis {
  switch (direction) {
    case "left":
    case "right":
      return "x";
    case "top":
    case "bottom":
    case "center":
      return "y";
  }
}

/**
 * Get the sign multiplier for translate based on direction.
 * Positive means moving in the positive axis direction.
 */
export function getDirectionSign(direction: DialogOpenDirection): number {
  switch (direction) {
    case "top":
    case "left":
      return -1;
    case "bottom":
    case "right":
    case "center":
      return 1;
  }
}

/**
 * Compute the close animation transform values.
 *
 * The close animation has two phases:
 * - Phase 1 (0-70%): Translate movement with easeOutExpo (natural deceleration)
 * - Phase 2 (70-100%): Scale shrink + accelerated translate with easeInExpo ("suck in" effect)
 *
 * @param progress - Animation progress (0 = open, 1 = fully closed)
 * @param containerSize - Size of the container in the animation direction (width or height)
 * @param direction - Direction the dialog is closing towards
 * @returns Transform values for the current progress
 */
export function computeCloseTransform(
  progress: number,
  containerSize: number,
  direction: DialogOpenDirection = "bottom",
): DialogTransform {
  const sign = getDirectionSign(direction);
  const translateTarget = containerSize * 0.5; // Move 50% of container size

  if (progress < PHASE_TRANSITION) {
    // Phase 1: translate only, no scale change
    const phase1Progress = progress / PHASE_TRANSITION;
    const easedProgress = easings.easeOutExpo(phase1Progress);

    return {
      translate: sign * translateTarget * easedProgress * 0.7, // 70% of translate in phase 1
      scale: 1.0,
      backdropOpacity: 1.0 - progress * 0.5, // Fade backdrop gradually
    };
  }

  // Phase 2: scale + accelerated translate
  const phase2Progress = (progress - PHASE_TRANSITION) / (1 - PHASE_TRANSITION);
  const easedProgress = easeInExpo(phase2Progress);

  return {
    translate: sign * translateTarget * (0.7 + 0.3 * easedProgress),
    scale: 1.0 - (1.0 - FINAL_SCALE) * easedProgress,
    backdropOpacity: 0.5 - 0.5 * easedProgress, // Finish fading
  };
}

/**
 * Compute the open animation transform values.
 * This is the reverse of the close animation.
 *
 * @param progress - Animation progress (0 = closed, 1 = fully open)
 * @param containerSize - Size of the container in the animation direction
 * @param direction - Direction the dialog is opening from
 * @returns Transform values for the current progress
 */
export function computeOpenTransform(
  progress: number,
  containerSize: number,
  direction: DialogOpenDirection = "bottom",
): DialogTransform {
  // Reverse the close animation
  return computeCloseTransform(1 - progress, containerSize, direction);
}

/**
 * Compute transform values during a swipe gesture.
 * This provides real-time feedback as the user swipes.
 *
 * @param displacement - Current swipe displacement in pixels
 * @param containerSize - Size of the container in the animation direction
 * @returns Transform values for current swipe state
 */
export function computeSwipeTransform(
  displacement: number,
  containerSize: number,
): DialogTransform {
  const progress = Math.min(Math.abs(displacement) / containerSize, 1);

  // Light scale feedback during swipe (max 2% reduction)
  const scale = 1.0 - 0.02 * progress;

  // Backdrop fades with swipe progress
  const backdropOpacity = 1.0 - progress * 0.8;

  return {
    translate: displacement,
    scale,
    backdropOpacity,
  };
}

/**
 * Check if the swipe should trigger a dismiss action.
 *
 * @param displacement - Final swipe displacement in pixels
 * @param velocity - Final swipe velocity in px/ms
 * @param containerSize - Size of the container
 * @param threshold - Threshold ratio (0-1) for dismiss (default: 0.3)
 * @returns Whether the dialog should be dismissed
 */
export function shouldDismiss(
  displacement: number,
  velocity: number,
  containerSize: number,
  threshold: number = 0.3,
): boolean {
  const absDisplacement = Math.abs(displacement);
  const absVelocity = Math.abs(velocity);

  // Dismiss if displacement exceeds threshold
  if (absDisplacement >= containerSize * threshold) {
    return true;
  }

  // Dismiss if velocity is high enough (quick flick)
  if (absVelocity >= 0.5) {
    // 0.5 px/ms = 500 px/s
    return true;
  }

  return false;
}

/**
 * Get the close direction based on swipe displacement.
 * The dialog closes in the direction of the swipe.
 *
 * @param displacementX - Horizontal displacement
 * @param displacementY - Vertical displacement
 * @param defaultDirection - Default direction if no clear winner
 * @returns The determined close direction
 */
export function getCloseDirectionFromSwipe(
  displacementX: number,
  displacementY: number,
  defaultDirection: DialogOpenDirection = "bottom",
): DialogOpenDirection {
  const absX = Math.abs(displacementX);
  const absY = Math.abs(displacementY);

  if (absY > absX) {
    return displacementY > 0 ? "bottom" : "top";
  }
  if (absX > absY) {
    return displacementX > 0 ? "right" : "left";
  }

  return defaultDirection;
}

/**
 * Check if View Transitions API is supported.
 */
export function supportsViewTransitions(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  return "startViewTransition" in document;
}

/**
 * Execute a callback with View Transitions API, with fallback.
 *
 * @param callback - The DOM-changing callback to wrap
 * @returns Promise<boolean> - true if viewTransition was used, false if fallback
 */
export async function safeViewTransition(callback: () => void): Promise<boolean> {
  if (!supportsViewTransitions()) {
    return false;
  }

  try {
    const transition = (document as Document & { startViewTransition: (cb: () => void) => ViewTransition }).startViewTransition(callback);
    await transition.finished;
    return true;
  } catch (error) {
    console.warn("viewTransition failed, using JS fallback:", error);
    return false;
  }
}

/**
 * ViewTransition type (for TypeScript).
 */
type ViewTransition = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
};

/**
 * Ease-in exponential function for "suck in" effect.
 * Accelerates towards the end.
 */
function easeInExpo(t: number): number {
  if (t === 0) {
    return 0;
  }
  return Math.pow(2, 10 * t - 10);
}

/**
 * Build CSS transform string from transform values.
 *
 * @param transform - Transform values
 * @param axis - Animation axis ('x' or 'y')
 * @returns CSS transform string
 */
export function buildTransformString(transform: DialogTransform, axis: DialogAnimationAxis): string {
  const translateFn = axis === "x" ? "translateX" : "translateY";
  return `${translateFn}(${transform.translate}px) scale(${transform.scale})`;
}

/**
 * Build CSS for backdrop based on transform values.
 *
 * @param transform - Transform values
 * @returns CSS properties for backdrop
 */
export function buildBackdropStyle(transform: DialogTransform): React.CSSProperties {
  return {
    opacity: transform.backdropOpacity,
  };
}
