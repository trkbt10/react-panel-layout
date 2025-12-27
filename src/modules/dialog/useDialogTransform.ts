/**
 * @file Hook for managing dialog transform during swipe and animation.
 *
 * This hook provides:
 * - Real-time transform updates during swipe gestures
 * - Smooth open/close animations with multi-phase easing
 * - Backdrop opacity animation
 * - Support for viewTransition API (optional)
 */
import * as React from "react";
import { useAnimationFrame, easings } from "../../hooks/useAnimationFrame.js";
import type { ContinuousOperationState } from "../../hooks/gesture/types.js";
import type { DialogOpenDirection, DialogTransform } from "./dialogAnimationUtils.js";
import {
  computeSwipeTransform,
  computeOpenTransform,
  computeCloseTransform,
  getAnimationAxis,
  buildTransformString,
  safeViewTransition,
} from "./dialogAnimationUtils.js";

/**
 * Default animation duration in milliseconds.
 */
const DEFAULT_ANIMATION_DURATION = 350;

/**
 * Phase of dialog animation lifecycle.
 */
export type DialogAnimationPhase = "idle" | "opening" | "open" | "closing" | "closed";

/**
 * 2D displacement for free movement.
 */
export type Displacement2D = {
  x: number;
  y: number;
};

/**
 * Options for useDialogTransform hook.
 */
export type UseDialogTransformOptions = {
  /** Ref to the dialog content element */
  elementRef: React.RefObject<HTMLElement | null>;
  /** Ref to the backdrop element */
  backdropRef: React.RefObject<HTMLElement | null>;
  /** Whether the dialog is visible */
  visible: boolean;
  /** Direction the dialog opens from */
  openDirection: DialogOpenDirection;
  /** Current swipe state */
  swipeState: ContinuousOperationState;
  /** Current swipe displacement in pixels (primary axis) */
  displacement: number;
  /** Full 2D displacement for free movement */
  displacement2D: Displacement2D;
  /** Animation duration in ms. @default 350 */
  animationDuration?: number;
  /** Whether to use viewTransition API for close animation */
  useViewTransition?: boolean;
  /** Callback when open animation completes */
  onOpenComplete?: () => void;
  /** Callback when close animation completes */
  onCloseComplete?: () => void;
};

/**
 * Result from useDialogTransform hook.
 */
export type UseDialogTransformResult = {
  /** Current animation phase */
  phase: DialogAnimationPhase;
  /** Whether any animation is running */
  isAnimating: boolean;
  /** Trigger close animation (use instead of setting visible=false directly) */
  triggerClose: () => Promise<void>;
};

/**
 * Apply transform values to elements.
 */
function applyTransform(
  element: HTMLElement | null,
  backdrop: HTMLElement | null,
  transform: DialogTransform,
  axis: "x" | "y",
): void {
  if (element) {
    element.style.transform = buildTransformString(transform, axis);
  }
  if (backdrop) {
    backdrop.style.opacity = String(transform.backdropOpacity);
  }
}

/**
 * Hook for managing dialog transform during swipe and animation.
 *
 * During swipe: directly updates element transform based on displacement.
 * After swipe: animates to target position (close or snap back).
 * On visible change: animates open/close transition.
 *
 * @example
 * ```tsx
 * const { phase, isAnimating, triggerClose } = useDialogTransform({
 *   elementRef,
 *   backdropRef,
 *   visible,
 *   openDirection: "bottom",
 *   swipeState: inputState,
 *   displacement: inputDisplacement,
 *   onCloseComplete: () => onClose(),
 * });
 * ```
 */
export function useDialogTransform(
  options: UseDialogTransformOptions,
): UseDialogTransformResult {
  const {
    elementRef,
    backdropRef,
    visible,
    openDirection,
    swipeState,
    displacement,
    displacement2D,
    animationDuration = DEFAULT_ANIMATION_DURATION,
    useViewTransition = false,
    onOpenComplete,
    onCloseComplete,
  } = options;

  const axis = getAnimationAxis(openDirection);
  const [phase, setPhase] = React.useState<DialogAnimationPhase>(visible ? "open" : "closed");
  const containerSizeRef = React.useRef<number>(0);
  const animationRef = React.useRef<{
    type: "open" | "close" | "snapback";
    startPx?: number;
    start2D?: Displacement2D;
  } | null>(null);

  // Track container size - measure synchronously to ensure dimensions are available for animations
  const measureContainerSize = React.useCallback((): number => {
    const element = elementRef.current;
    if (!element) {
      return 0;
    }
    const size = axis === "x" ? element.clientWidth : element.clientHeight;
    containerSizeRef.current = size;
    return size;
  }, [elementRef, axis]);

  // Initial measurement and ResizeObserver setup
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    measureContainerSize();

    const observer = new ResizeObserver(measureContainerSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, measureContainerSize]);

  // Animation frame handlers
  const handleFrame = React.useCallback(
    ({ easedProgress }: { easedProgress: number }) => {
      const element = elementRef.current;
      const backdrop = backdropRef.current;
      const anim = animationRef.current;

      if (!element || !anim) {
        return;
      }

      // Measure container size if not yet available (first frame after becoming visible)
      const getContainerSize = (): number => {
        const cachedSize = containerSizeRef.current;
        if (cachedSize > 0) {
          return cachedSize;
        }
        return measureContainerSize();
      };
      const containerSize = getContainerSize();
      if (containerSize <= 0) {
        return; // Still no size, skip this frame
      }

      // Handle snapback with 2D animation
      if (anim.type === "snapback") {
        const start2D = anim.start2D ?? { x: 0, y: 0 };
        const startPx = Math.abs(anim.startPx ?? 0);
        const startTransform = computeSwipeTransform(startPx, containerSize);

        // Interpolate 2D position back to origin
        const currentX = start2D.x * (1 - easedProgress);
        const currentY = start2D.y * (1 - easedProgress);
        const currentScale = startTransform.scale * (1 - easedProgress) + 1 * easedProgress;
        const currentOpacity = startTransform.backdropOpacity * (1 - easedProgress) + 1 * easedProgress;

        element.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
        if (backdrop) {
          backdrop.style.opacity = String(currentOpacity);
        }
        return;
      }

      // Handle open/close animations (1D based on direction)
      const computeAnimTransform = (): DialogTransform => {
        if (anim.type === "open") {
          return computeOpenTransform(easedProgress, containerSize, openDirection);
        }
        return computeCloseTransform(easedProgress, containerSize, openDirection);
      };

      const transform = computeAnimTransform();
      applyTransform(element, backdrop, transform, axis);
    },
    [elementRef, backdropRef, openDirection, axis, measureContainerSize],
  );

  const handleComplete = React.useCallback(() => {
    const anim = animationRef.current;
    animationRef.current = null;

    if (anim?.type === "open") {
      setPhase("open");
      onOpenComplete?.();
    } else if (anim?.type === "close") {
      setPhase("closed");
      onCloseComplete?.();
    } else {
      // snapback
      setPhase("open");
    }

    // Reset transform to identity for open state
    if (anim?.type !== "close") {
      const element = elementRef.current;
      const backdrop = backdropRef.current;
      if (element) {
        element.style.transform = "";
      }
      if (backdrop) {
        backdrop.style.opacity = "";
      }
    }
  }, [elementRef, backdropRef, onOpenComplete, onCloseComplete]);

  const { isAnimating, start, cancel } = useAnimationFrame({
    duration: animationDuration,
    easing: easings.easeOutExpo,
    onFrame: handleFrame,
    onComplete: handleComplete,
  });

  // Handle swipe displacement during operation - free 2D movement
  React.useLayoutEffect(() => {
    if (swipeState.phase !== "operating") {
      return;
    }

    // Cancel any running animation
    if (isAnimating) {
      cancel();
      animationRef.current = null;
    }

    const element = elementRef.current;
    const backdrop = backdropRef.current;

    if (!element) {
      return;
    }

    // Measure container size if not yet available
    const getContainerSize = (): number => {
      const cachedSize = containerSizeRef.current;
      if (cachedSize > 0) {
        return cachedSize;
      }
      return measureContainerSize();
    };
    const containerSize = getContainerSize();
    if (containerSize <= 0) {
      return;
    }

    // Use primary axis displacement for scale/opacity calculation
    const transform = computeSwipeTransform(Math.abs(displacement), containerSize);

    // Apply 2D translation with scale feedback
    element.style.transform = `translate(${displacement2D.x}px, ${displacement2D.y}px) scale(${transform.scale})`;
    if (backdrop) {
      backdrop.style.opacity = String(transform.backdropOpacity);
    }
  }, [swipeState.phase, displacement, displacement2D, elementRef, backdropRef, isAnimating, cancel, measureContainerSize]);

  // Handle swipe end - determine if we should close or snap back
  React.useLayoutEffect(() => {
    if (swipeState.phase !== "ended") {
      return;
    }

    // The actual dismiss decision is made in useDialogSwipeInput
    // Here we just handle the snap-back animation if not dismissed
    // (onSwipeDismiss callback will set visible=false if threshold was met)

    // If still visible after swipe ended, snap back with 2D animation
    const hasMovement = Math.abs(displacement2D.x) > 1 || Math.abs(displacement2D.y) > 1;
    if (visible && hasMovement) {
      animationRef.current = {
        type: "snapback",
        startPx: displacement,
        start2D: { ...displacement2D },
      };
      setPhase("opening"); // Reuse opening phase for snapback
      start();
    }
  }, [swipeState.phase, visible, displacement, displacement2D, start]);

  // Handle visibility changes (external control)
  const prevVisibleRef = React.useRef(visible);

  React.useLayoutEffect(() => {
    const wasVisible = prevVisibleRef.current;
    prevVisibleRef.current = visible;

    if (wasVisible === visible) {
      return;
    }

    if (visible) {
      // Opening
      animationRef.current = { type: "open" };
      setPhase("opening");
      start();
    }
    // Note: closing is handled by triggerClose for better control
  }, [visible, start]);

  // Trigger close animation
  const triggerClose = React.useCallback(async (): Promise<void> => {
    if (phase === "closing" || phase === "closed") {
      return;
    }

    setPhase("closing");

    const element = elementRef.current;
    const containerSize = containerSizeRef.current;

    // Try viewTransition first if enabled
    const computeCanUseViewTransition = (): boolean => {
      if (!useViewTransition) {
        return false;
      }
      if (element === null) {
        return false;
      }
      if (containerSize <= 0) {
        return false;
      }
      return true;
    };
    const canUseViewTransition = computeCanUseViewTransition();
    if (canUseViewTransition) {
      // TypeScript narrowing: element is guaranteed non-null here
      const dialogElement = element as HTMLElement;

      // Set CSS variable for current position
      const currentDisplacement = displacement;
      dialogElement.style.setProperty("--swipe-end-position", `${currentDisplacement}px`);
      dialogElement.style.viewTransitionName = "dialog-content";

      const used = await safeViewTransition(() => {
        // The DOM change callback - this is where onCloseComplete would be called
        // But we need to wait for animation to complete first
      });

      if (used) {
        dialogElement.style.viewTransitionName = "";
        setPhase("closed");
        onCloseComplete?.();
        return;
      }

      // Fallback to JS animation
      dialogElement.style.viewTransitionName = "";
    }

    // JS-based close animation
    animationRef.current = { type: "close" };
    start();
  }, [phase, elementRef, displacement, useViewTransition, start, onCloseComplete]);

  return {
    phase,
    isAnimating,
    triggerClose,
  };
}
