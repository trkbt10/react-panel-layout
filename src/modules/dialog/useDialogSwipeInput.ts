/**
 * @file Hook for detecting swipe gestures to dismiss a dialog.
 *
 * This hook provides free 2D movement during swipe:
 * - User can drag in any direction freely
 * - Close intent is detected on release based on displacement direction
 * - If movement matches close direction and exceeds threshold, dismiss
 * - Otherwise, snap back to original position
 */
import * as React from "react";
import { usePointerTracking } from "../../hooks/gesture/usePointerTracking.js";
import {
  type ContinuousOperationState,
  type Vector2,
  IDLE_CONTINUOUS_OPERATION_STATE,
} from "../../hooks/gesture/types.js";
import type { DialogOpenDirection } from "./dialogAnimationUtils.js";
import { getAnimationAxis, getDirectionSign } from "./dialogAnimationUtils.js";

/**
 * Default dismiss threshold (30% of container size).
 */
const DEFAULT_DISMISS_THRESHOLD = 0.3;

/**
 * Velocity threshold for quick flick dismissal (px/ms).
 */
const VELOCITY_THRESHOLD = 0.5;

/**
 * Options for useDialogSwipeInput hook.
 */
export type UseDialogSwipeInputOptions = {
  /** Ref to the dialog container element */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Direction the dialog opened from (swipe closes in same direction) */
  openDirection: DialogOpenDirection;
  /** Whether swipe dismiss is enabled */
  enabled: boolean;
  /** Callback when swipe exceeds threshold and dialog should dismiss */
  onSwipeDismiss: () => void;
  /** Threshold ratio (0-1) of container size to trigger dismiss. @default 0.3 */
  dismissThreshold?: number;
};

/**
 * Result from useDialogSwipeInput hook.
 */
export type UseDialogSwipeInputResult = {
  /** Current operation state (idle, operating, or ended) */
  state: ContinuousOperationState;
  /** Props to spread on the container element */
  containerProps: React.HTMLAttributes<HTMLElement> & {
    style: React.CSSProperties;
  };
  /** Swipe progress (0-1) towards dismiss threshold */
  progress: number;
  /** Whether user is currently swiping */
  isOperating: boolean;
  /** Current displacement in pixels (primary axis based on openDirection) */
  displacement: number;
  /** Full 2D displacement for free movement transform */
  displacement2D: Vector2;
};

/**
 * Check if an element or its ancestors are scrollable in any direction.
 */
function isScrollableElement(element: HTMLElement): boolean {
  const style = getComputedStyle(element);

  const isScrollableX =
    (style.overflowX === "scroll" || style.overflowX === "auto") &&
    element.scrollWidth > element.clientWidth;

  const isScrollableY =
    (style.overflowY === "scroll" || style.overflowY === "auto") &&
    element.scrollHeight > element.clientHeight;

  return isScrollableX || isScrollableY;
}

/**
 * Check if we should start tracking based on scroll state.
 * Returns false if the target is inside a scrollable element that can scroll in the drag direction.
 */
function shouldStartDrag(event: React.PointerEvent, container: HTMLElement): boolean {
  // eslint-disable-next-line no-restricted-syntax -- loop variable requires let
  let current = event.target as HTMLElement | null;

  while (current !== null && current !== container) {
    if (isScrollableElement(current)) {
      return false;
    }
    current = current.parentElement;
  }

  return true;
}

/**
 * Hook for detecting swipe gestures to dismiss a dialog.
 *
 * Allows free 2D movement - user can drag in any direction.
 * On release, detects if the movement matches the close direction:
 * - "center" or "bottom": close if moved down significantly
 * - "top": close if moved up significantly
 * - "left": close if moved left significantly
 * - "right": close if moved right significantly
 *
 * @example
 * ```tsx
 * const { state, containerProps, displacement2D } = useDialogSwipeInput({
 *   containerRef,
 *   openDirection: "bottom",
 *   enabled: true,
 *   onSwipeDismiss: () => setVisible(false),
 * });
 *
 * // Apply 2D transform for free movement
 * style={{ transform: `translate(${displacement2D.x}px, ${displacement2D.y}px)` }}
 * ```
 */
export function useDialogSwipeInput(
  options: UseDialogSwipeInputOptions,
): UseDialogSwipeInputResult {
  const {
    containerRef,
    openDirection,
    enabled,
    onSwipeDismiss,
    dismissThreshold = DEFAULT_DISMISS_THRESHOLD,
  } = options;

  const axis = getAnimationAxis(openDirection);
  const expectedSign = getDirectionSign(openDirection);

  // Track container size for progress calculation
  const containerSizeRef = React.useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateSize = () => {
      containerSizeRef.current = {
        width: container.clientWidth,
        height: container.clientHeight,
      };
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef]);

  // Use pointer tracking for free 2D movement
  const { state: tracking, onPointerDown: baseOnPointerDown } = usePointerTracking({
    enabled,
  });

  // Track displacement for snapback and release detection
  const lastDisplacementRef = React.useRef<Vector2>({ x: 0, y: 0 });

  // Wrap pointer down with scrollable check
  const onPointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      if (!enabled) {
        return;
      }
      const container = containerRef.current;
      if (!container) {
        return;
      }
      if (!shouldStartDrag(event, container)) {
        return;
      }
      baseOnPointerDown(event);
    },
    [enabled, containerRef, baseOnPointerDown],
  );

  // Calculate 2D displacement - preserve last value on release for snapback
  const displacement2D = React.useMemo<Vector2>(() => {
    if (!tracking.isDown || !tracking.start || !tracking.current) {
      // Return last known displacement for snapback animation
      return lastDisplacementRef.current;
    }
    return {
      x: tracking.current.x - tracking.start.x,
      y: tracking.current.y - tracking.start.y,
    };
  }, [tracking.isDown, tracking.start, tracking.current]);

  // Calculate primary axis displacement for progress
  const primaryDisplacement = axis === "x" ? displacement2D.x : displacement2D.y;

  // Calculate progress towards dismiss threshold (only for correct direction)
  const progress = React.useMemo(() => {
    const containerSize = axis === "x" ? containerSizeRef.current.width : containerSizeRef.current.height;
    if (containerSize <= 0) {
      return 0;
    }
    const sign = primaryDisplacement > 0 ? 1 : primaryDisplacement < 0 ? -1 : 0;
    if (sign !== expectedSign) {
      return 0; // Wrong direction
    }
    return Math.min(Math.abs(primaryDisplacement) / containerSize, 1);
  }, [axis, primaryDisplacement, expectedSign]);

  // State machine for operation phase
  const [operationPhase, setOperationPhase] = React.useState<"idle" | "operating" | "ended">("idle");

  // Store displacement while dragging
  React.useEffect(() => {
    if (tracking.isDown && tracking.current) {
      lastDisplacementRef.current = displacement2D;
    }
  }, [tracking.isDown, tracking.current, displacement2D]);

  // Handle drag start
  React.useEffect(() => {
    if (tracking.isDown && operationPhase === "idle") {
      setOperationPhase("operating");
    }
  }, [tracking.isDown, operationPhase]);

  // Handle release - transition to "ended" then check dismiss
  React.useEffect(() => {
    if (!tracking.isDown && operationPhase === "operating") {
      const hasMovement = Math.abs(lastDisplacementRef.current.x) > 1 || Math.abs(lastDisplacementRef.current.y) > 1;

      if (hasMovement) {
        // Transition to ended phase for snapback detection
        setOperationPhase("ended");

        // Check if should dismiss
        const containerSize = axis === "x" ? containerSizeRef.current.width : containerSizeRef.current.height;
        if (containerSize > 0) {
          const finalDisplacement = lastDisplacementRef.current;
          const primaryValue = axis === "x" ? finalDisplacement.x : finalDisplacement.y;
          const sign = primaryValue > 0 ? 1 : primaryValue < 0 ? -1 : 0;

          if (sign === expectedSign) {
            const ratio = Math.abs(primaryValue) / containerSize;
            const velocity = tracking.start && tracking.current
              ? Math.abs(primaryValue) / Math.max(1, tracking.current.timestamp - tracking.start.timestamp)
              : 0;

            if (ratio >= dismissThreshold || velocity >= VELOCITY_THRESHOLD) {
              onSwipeDismiss();
            }
          }
        }
      } else {
        // No significant movement, go directly to idle
        setOperationPhase("idle");
        lastDisplacementRef.current = { x: 0, y: 0 };
      }
    }
  }, [tracking.isDown, operationPhase, axis, expectedSign, dismissThreshold, onSwipeDismiss, tracking.start, tracking.current]);

  // Transition from ended to idle after one render (to allow snapback detection)
  React.useEffect(() => {
    if (operationPhase === "ended") {
      // Use microtask to ensure the "ended" state is seen by consumers
      queueMicrotask(() => {
        setOperationPhase("idle");
        lastDisplacementRef.current = { x: 0, y: 0 };
      });
    }
  }, [operationPhase]);

  // Build continuous operation state
  const state = React.useMemo<ContinuousOperationState>(() => {
    if (operationPhase === "idle") {
      return IDLE_CONTINUOUS_OPERATION_STATE;
    }
    if (operationPhase === "ended") {
      return {
        phase: "ended",
        displacement: lastDisplacementRef.current,
        velocity: { x: 0, y: 0 },
      };
    }
    return {
      phase: "operating",
      displacement: displacement2D,
      velocity: { x: 0, y: 0 },
    };
  }, [operationPhase, displacement2D]);

  const containerProps = React.useMemo(() => {
    return {
      onPointerDown,
      style: {
        touchAction: "none" as const, // Allow free 2D movement
        userSelect: "none" as const,
        WebkitUserSelect: "none" as const,
      },
    };
  }, [onPointerDown]);

  const isOperating = state.phase === "operating";

  return {
    state,
    containerProps,
    progress,
    isOperating,
    displacement: primaryDisplacement,
    displacement2D,
  };
}
