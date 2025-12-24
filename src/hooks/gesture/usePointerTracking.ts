/**
 * @file Hook for tracking pointer state during gestures.
 *
 * Provides low-level pointer tracking with position, velocity, and timing.
 * This hook serves as the foundation for higher-level gesture hooks.
 */
import * as React from "react";
import { useDocumentPointerEvents } from "../useDocumentPointerEvents.js";
import { useEffectEvent } from "../useEffectEvent.js";
import type {
  PointerTrackingState,
  TimestampedPoint,
  UsePointerTrackingOptions,
  UsePointerTrackingResult,
} from "./types.js";

/**
 * Initial state for pointer tracking.
 */
const INITIAL_STATE: PointerTrackingState = {
  isDown: false,
  start: null,
  current: null,
  pointerId: null,
};

/**
 * Creates a timestamped point from pointer event coordinates.
 */
const createTimestampedPoint = (clientX: number, clientY: number): TimestampedPoint => ({
  x: clientX,
  y: clientY,
  timestamp: performance.now(),
});

/**
 * Hook for tracking pointer state during gestures.
 *
 * Tracks pointer down/move/up events and provides position and timing data
 * that can be used by higher-level gesture detection hooks.
 *
 * @example
 * ```tsx
 * const { state, onPointerDown, reset } = usePointerTracking({
 *   enabled: true,
 *   primaryOnly: true,
 * });
 *
 * return (
 *   <div onPointerDown={onPointerDown}>
 *     {state.isDown && <span>Tracking...</span>}
 *   </div>
 * );
 * ```
 */
export function usePointerTracking(options: UsePointerTrackingOptions): UsePointerTrackingResult {
  const { enabled, primaryOnly = true } = options;

  const [state, setState] = React.useState<PointerTrackingState>(INITIAL_STATE);

  const reset = React.useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const handlePointerDown = useEffectEvent((event: React.PointerEvent) => {
    if (!enabled) {
      return;
    }

    // Filter non-primary pointers if primaryOnly is set
    if (primaryOnly && !event.isPrimary) {
      return;
    }

    // Only track left mouse button or touch/pen
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const point = createTimestampedPoint(event.clientX, event.clientY);

    setState({
      isDown: true,
      start: point,
      current: point,
      pointerId: event.pointerId,
    });
  });

  const handlePointerMove = useEffectEvent((event: PointerEvent) => {
    // Verify this is the tracked pointer
    if (state.pointerId !== event.pointerId) {
      return;
    }

    const point = createTimestampedPoint(event.clientX, event.clientY);

    setState((prev) => ({
      ...prev,
      current: point,
    }));
  });

  const handlePointerEnd = useEffectEvent(() => {
    setState(INITIAL_STATE);
  });

  // Use document-level pointer events for tracking after pointer down
  const shouldTrackDocument = state.isDown ? enabled : false;
  useDocumentPointerEvents(shouldTrackDocument, {
    onMove: handlePointerMove,
    onUp: handlePointerEnd,
    onCancel: handlePointerEnd,
  });

  // Reset state when disabled
  React.useEffect(() => {
    if (!enabled && state.isDown) {
      reset();
    }
  }, [enabled, state.isDown, reset]);

  return {
    state,
    onPointerDown: handlePointerDown,
    reset,
  };
}
