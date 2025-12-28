/**
 * @file Hook for detecting swipe gestures to open/close a drawer.
 *
 * Combines:
 * - Edge swipe detection for opening (Stack pattern)
 * - Drag-to-close within drawer (Dialog pattern)
 * - Native gesture guard for browser back prevention
 */
import * as React from "react";
import { useEdgeSwipeInput } from "../../hooks/gesture/useEdgeSwipeInput.js";
import { useNativeGestureGuard } from "../../hooks/gesture/useNativeGestureGuard.js";
import { usePointerTracking } from "../../hooks/gesture/usePointerTracking.js";
import {
  mergeGestureContainerProps,
  isScrollableInDirection,
} from "../../hooks/gesture/utils.js";
import { isInSwipeSafeZone } from "../../components/gesture/SwipeSafeZone.js";
import {
  type ContinuousOperationState,
  IDLE_CONTINUOUS_OPERATION_STATE,
} from "../../hooks/gesture/types.js";
import type { UseDrawerSwipeInputOptions, UseDrawerSwipeInputResult } from "./types.js";
import { getDrawerAnimationAxis, getDrawerCloseSwipeSign, getDrawerOpenSwipeSign } from "./types.js";

/**
 * Default dismiss threshold (30% of container size).
 */
const DEFAULT_DISMISS_THRESHOLD = 0.3;

/**
 * Velocity threshold for quick flick dismissal (px/ms).
 */
const VELOCITY_THRESHOLD = 0.5;

// ============================================================================
// Helper functions (extracted to avoid ternary violations)
// ============================================================================

function getContainerSize(container: HTMLElement, axis: "x" | "y"): number {
  if (axis === "x") {
    return container.clientWidth;
  }
  return container.clientHeight;
}

function getAxisDelta(
  start: { x: number; y: number },
  current: { x: number; y: number },
  axis: "x" | "y",
): number {
  if (axis === "x") {
    return current.x - start.x;
  }
  return current.y - start.y;
}

const PHASE_MAP: Record<string, "idle" | "operating" | "ended"> = {
  idle: "idle",
  ended: "ended",
};

function normalizePhase(phase: string): "idle" | "operating" | "ended" {
  return PHASE_MAP[phase] ?? "operating";
}

function computeDisplacementValue(
  closeSwipeSign: 1 | -1,
  axis: "x" | "y",
  closeDisplacement: number,
): { x: number; y: number } {
  const signedDisplacement = closeSwipeSign * closeDisplacement;
  if (axis === "x") {
    return { x: signedDisplacement, y: 0 };
  }
  return { x: 0, y: signedDisplacement };
}

function computeAxisDisplacement(
  displacement: { x: number; y: number },
  axis: "x" | "y",
): number {
  if (axis === "x") {
    return Math.abs(displacement.x);
  }
  return Math.abs(displacement.y);
}

function isEdgeSwipeEnabled(enableEdgeSwipeOpen: boolean, isOpen: boolean): boolean {
  if (!enableEdgeSwipeOpen) {
    return false;
  }
  return !isOpen;
}

function isCloseSwipeEnabled(enableSwipeClose: boolean, isOpen: boolean): boolean {
  if (!enableSwipeClose) {
    return false;
  }
  return isOpen;
}

function isDrawerOpening(isEdgeGesture: boolean, isOpen: boolean): boolean {
  if (!isEdgeGesture) {
    return false;
  }
  return !isOpen;
}

function isDrawerClosing(closePhase: "idle" | "operating" | "ended", isOpen: boolean): boolean {
  if (closePhase === "idle") {
    return false;
  }
  return isOpen;
}

function computeVelocity(
  start: { x: number; y: number; timestamp: number } | null,
  current: { x: number; y: number; timestamp: number } | null,
  displacement: number,
): number {
  if (!start || !current) {
    return 0;
  }
  const timeDelta = Math.max(1, current.timestamp - start.timestamp);
  return displacement / timeDelta;
}

/**
 * Hook for detecting swipe gestures to open/close a drawer.
 *
 * When drawer is closed:
 * - Detects edge swipe from the anchor edge to trigger open
 *
 * When drawer is open:
 * - Detects drag gesture within drawer to trigger close
 * - Respects scrollable content boundaries
 *
 * @example
 * ```tsx
 * const { state, edgeContainerProps, drawerContentProps } = useDrawerSwipeInput({
 *   edgeContainerRef: gridLayoutRef,
 *   drawerContentRef: drawerRef,
 *   direction: "left",
 *   isOpen,
 *   onSwipeOpen: () => setOpen(true),
 *   onSwipeClose: () => setOpen(false),
 * });
 * ```
 */
export function useDrawerSwipeInput(
  options: UseDrawerSwipeInputOptions,
): UseDrawerSwipeInputResult {
  const {
    edgeContainerRef,
    drawerContentRef,
    direction,
    isOpen,
    onSwipeOpen,
    onSwipeClose,
    enableEdgeSwipeOpen = true,
    enableSwipeClose = true,
    edgeWidth = 20,
    dismissThreshold = DEFAULT_DISMISS_THRESHOLD,
  } = options;

  const axis = getDrawerAnimationAxis(direction);
  const closeSwipeSign = getDrawerCloseSwipeSign(direction);
  const openSwipeSign = getDrawerOpenSwipeSign(direction);

  // Track container size for progress calculation
  const containerSizeRef = React.useRef(0);

  // Measure drawer content size
  React.useLayoutEffect(() => {
    const container = drawerContentRef.current;
    if (!container) {
      return;
    }

    const updateSize = () => {
      containerSizeRef.current = getContainerSize(container, axis);
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [drawerContentRef, axis]);

  // =========== Edge swipe to OPEN ===========
  const handleOpenSwipeEnd = React.useCallback(
    (state: { direction: 1 | -1 | 0 }) => {
      // Open when swiping in the correct direction (away from edge)
      if (state.direction === openSwipeSign) {
        onSwipeOpen();
      }
    },
    [openSwipeSign, onSwipeOpen],
  );

  const {
    isEdgeGesture,
    state: edgeSwipeState,
    containerProps: edgeSwipeProps,
  } = useEdgeSwipeInput({
    containerRef: edgeContainerRef,
    edge: direction,
    edgeWidth,
    enabled: isEdgeSwipeEnabled(enableEdgeSwipeOpen, isOpen),
    onSwipeEnd: handleOpenSwipeEnd,
  });

  // Native gesture guard for edge swipe
  const { containerProps: guardProps } = useNativeGestureGuard({
    containerRef: edgeContainerRef,
    active: isEdgeGesture,
    preventEdgeBack: true,
    preventOverscroll: true,
    edgeWidth,
  });

  // =========== Drag to CLOSE (Dialog pattern) ===========
  const { state: closeTracking, onPointerDown: baseClosePointerDown } = usePointerTracking({
    enabled: isCloseSwipeEnabled(enableSwipeClose, isOpen),
  });

  const [closePhase, setClosePhase] = React.useState<"idle" | "operating" | "ended">("idle");
  const lastCloseDisplacementRef = React.useRef(0);

  // Wrap pointer down with scroll check and safe zone check
  const onClosePointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      if (!enableSwipeClose || !isOpen) {
        return;
      }

      const container = drawerContentRef.current;
      if (!container) {
        return;
      }

      const target = event.target as HTMLElement;

      // Check if target is in a SwipeSafeZone
      if (isInSwipeSafeZone(target, container)) {
        return; // Don't start close swipe if inside safe zone
      }

      // Check if target is in a scrollable area that would block swipe
      if (isScrollableInDirection(target, container, axis, closeSwipeSign)) {
        return; // Don't start close swipe if inside scrollable content
      }

      baseClosePointerDown(event);
    },
    [enableSwipeClose, isOpen, drawerContentRef, axis, closeSwipeSign, baseClosePointerDown],
  );

  // Calculate close displacement
  const closeDisplacement = React.useMemo(() => {
    if (!closeTracking.isDown || !closeTracking.start || !closeTracking.current) {
      return lastCloseDisplacementRef.current;
    }

    const delta = getAxisDelta(closeTracking.start, closeTracking.current, axis);

    // Only count movement in close direction
    const signedDelta = delta * closeSwipeSign;
    return Math.max(0, signedDelta);
  }, [closeTracking.isDown, closeTracking.start, closeTracking.current, axis, closeSwipeSign]);

  // Track displacement while dragging
  React.useEffect(() => {
    if (closeTracking.isDown && closeTracking.current) {
      lastCloseDisplacementRef.current = closeDisplacement;
    }
  }, [closeTracking.isDown, closeTracking.current, closeDisplacement]);

  // Handle close drag start
  React.useEffect(() => {
    if (closeTracking.isDown && closePhase === "idle") {
      setClosePhase("operating");
    }
  }, [closeTracking.isDown, closePhase]);

  // Handle close drag end
  React.useEffect(() => {
    if (!closeTracking.isDown && closePhase === "operating") {
      const displacement = lastCloseDisplacementRef.current;
      const hasMovement = displacement > 1;

      if (hasMovement) {
        setClosePhase("ended");

        // Check if should close
        const containerSize = containerSizeRef.current;
        if (containerSize > 0) {
          const ratio = displacement / containerSize;
          const velocity = computeVelocity(closeTracking.start, closeTracking.current, displacement);

          if (ratio >= dismissThreshold || velocity >= VELOCITY_THRESHOLD) {
            onSwipeClose();
          }
        }
      } else {
        setClosePhase("idle");
        lastCloseDisplacementRef.current = 0;
      }
    }
  }, [closeTracking.isDown, closePhase, dismissThreshold, onSwipeClose, closeTracking.start, closeTracking.current]);

  // Transition from ended to idle
  React.useEffect(() => {
    if (closePhase === "ended") {
      queueMicrotask(() => {
        setClosePhase("idle");
        lastCloseDisplacementRef.current = 0;
      });
    }
  }, [closePhase]);

  // Reset close state when drawer closes
  React.useEffect(() => {
    if (!isOpen) {
      setClosePhase("idle");
      lastCloseDisplacementRef.current = 0;
    }
  }, [isOpen]);

  // =========== Combined state ===========
  const isOpening = isDrawerOpening(isEdgeGesture, isOpen);
  const isClosing = isDrawerClosing(closePhase, isOpen);

  // Determine primary displacement based on current operation
  const displacement = React.useMemo(() => {
    if (isOpening) {
      return computeAxisDisplacement(edgeSwipeState.displacement, axis);
    }
    if (isClosing) {
      return closeDisplacement;
    }
    return 0;
  }, [isOpening, isClosing, axis, edgeSwipeState.displacement, closeDisplacement]);

  // Progress calculation
  const progress = React.useMemo(() => {
    const containerSize = containerSizeRef.current;
    if (containerSize <= 0) {
      return 0;
    }
    return Math.min(displacement / containerSize, 1);
  }, [displacement]);

  // Combined operation state
  const state = React.useMemo<ContinuousOperationState>(() => {
    if (isOpening) {
      return {
        phase: normalizePhase(edgeSwipeState.phase),
        displacement: edgeSwipeState.displacement,
        velocity: edgeSwipeState.velocity,
      };
    }
    if (isClosing) {
      return {
        phase: closePhase,
        displacement: computeDisplacementValue(closeSwipeSign, axis, closeDisplacement),
        velocity: { x: 0, y: 0 },
      };
    }
    return IDLE_CONTINUOUS_OPERATION_STATE;
  }, [isOpening, isClosing, edgeSwipeState, closePhase, closeDisplacement, axis, closeSwipeSign]);

  // Container props
  const edgeContainerProps = React.useMemo(
    () => mergeGestureContainerProps(edgeSwipeProps, guardProps),
    [edgeSwipeProps, guardProps],
  );

  const drawerContentProps = React.useMemo(() => ({
    onPointerDown: onClosePointerDown,
    style: {
      touchAction: "none" as const,
      userSelect: "none" as const,
      WebkitUserSelect: "none" as const,
    },
  }), [onClosePointerDown]);

  return {
    state,
    isOpening,
    isClosing,
    progress,
    displacement,
    edgeContainerProps,
    drawerContentProps,
  };
}
