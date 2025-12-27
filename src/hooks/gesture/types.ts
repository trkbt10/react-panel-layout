/**
 * @file Type definitions for gesture input detection hooks.
 *
 * These types support the separation of concerns:
 * - Operation: what to do (navigate, push, pop)
 * - Input: how to command (swipe, click, keyboard)
 * - Presentation: how to show (animation, transition)
 *
 * This file defines types for the Input layer, including the abstract
 * ContinuousOperationState that represents any continuous state transition
 * (whether controlled by human gesture or system animation).
 */
import type * as React from "react";

/**
 * Axis for gesture detection.
 */
export type GestureAxis = "horizontal" | "vertical";

/**
 * 2D vector for displacement and velocity.
 */
export type Vector2 = {
  x: number;
  y: number;
};

// ============================================================================
// Continuous Operation State
// ============================================================================
// A continuous operation is any state transition that occurs over time,
// where progress can be observed incrementally. The controlling agent
// may be human (gesture) or system (animation).

/**
 * Phase of a continuous operation lifecycle.
 * - "idle": No operation in progress
 * - "operating": Operation is in progress (human or system controlled)
 * - "ended": Operation has completed
 */
export type ContinuousOperationPhase = "idle" | "operating" | "ended";

/**
 * State of a continuous operation.
 *
 * This is the abstract representation of any operation that occurs over time,
 * whether controlled by human gesture or system animation. Components that
 * accept this state can respond to both input types uniformly.
 */
export type ContinuousOperationState = {
  /** Current phase of the operation */
  phase: ContinuousOperationPhase;
  /** Displacement from start position in pixels */
  displacement: Vector2;
  /** Current velocity in pixels per millisecond */
  velocity: Vector2;
};

/**
 * Initial idle state for ContinuousOperationState.
 */
export const IDLE_CONTINUOUS_OPERATION_STATE: ContinuousOperationState = {
  phase: "idle",
  displacement: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
};

/**
 * Convert SwipeInputPhase to ContinuousOperationPhase.
 * - "idle" → "idle"
 * - "tracking" | "swiping" → "operating"
 * - "ended" → "ended"
 */
export function toContinuousPhase(phase: SwipeInputPhase): ContinuousOperationPhase {
  if (phase === "idle") return "idle";
  if (phase === "ended") return "ended";
  return "operating";
}

/**
 * Convert SwipeInputState to ContinuousOperationState.
 */
export function toContinuousOperationState(state: SwipeInputState): ContinuousOperationState {
  return {
    phase: toContinuousPhase(state.phase),
    displacement: state.displacement,
    velocity: state.velocity,
  };
}

// ============================================================================
// Swipe Input (concrete implementation of continuous operation)
// ============================================================================

/**
 * Phase of swipe input lifecycle.
 * - "idle": No swipe in progress
 * - "tracking": Pointer down, tracking movement (direction not yet locked)
 * - "swiping": Direction locked, actively swiping
 * - "ended": Swipe gesture completed
 */
export type SwipeInputPhase = "idle" | "tracking" | "swiping" | "ended";

/**
 * Point with timestamp for velocity calculation.
 */
export type TimestampedPoint = {
  x: number;
  y: number;
  timestamp: number;
};

/**
 * Swipe input state during gesture.
 */
export type SwipeInputState = {
  /** Current phase of the swipe input */
  phase: SwipeInputPhase;
  /** Displacement from start position in pixels */
  displacement: Vector2;
  /** Current velocity in pixels per millisecond */
  velocity: Vector2;
  /**
   * Direction of movement as a number.
   * -1 = backward (left/up), 0 = no movement, 1 = forward (right/down)
   */
  direction: -1 | 0 | 1;
};

/**
 * Thresholds for swipe input recognition.
 */
export type SwipeInputThresholds = {
  /** Minimum distance in pixels to trigger swipe. @default 50 */
  distanceThreshold: number;
  /** Minimum velocity in px/ms to trigger swipe. @default 0.3 */
  velocityThreshold: number;
  /** Distance threshold before direction is locked. @default 10 */
  lockThreshold: number;
};

/**
 * Options for usePointerTracking hook.
 */
export type UsePointerTrackingOptions = {
  /** Whether tracking is enabled */
  enabled: boolean;
  /** Restrict to primary pointer only (ignore multitouch). @default true */
  primaryOnly?: boolean;
};

/**
 * Result from usePointerTracking hook.
 */
export type UsePointerTrackingResult = {
  /** Current tracking state */
  state: PointerTrackingState;
  /** Handler to attach to onPointerDown */
  onPointerDown: (event: React.PointerEvent) => void;
  /** Reset tracking state */
  reset: () => void;
};

/**
 * Internal pointer tracking state.
 */
export type PointerTrackingState = {
  /** Whether pointer is currently down */
  isDown: boolean;
  /** Start position and timestamp */
  start: TimestampedPoint | null;
  /** Current position and timestamp */
  current: TimestampedPoint | null;
  /** Active pointer ID */
  pointerId: number | null;
  /** Whether tracking ended via pointercancel (not pointerup) */
  wasCanceled: boolean;
};

/**
 * Options for useDirectionalLock hook.
 */
export type UseDirectionalLockOptions = {
  /** Pointer tracking state from usePointerTracking */
  tracking: PointerTrackingState;
  /** Lock threshold in pixels. @default 10 */
  lockThreshold?: number;
};

/**
 * Result from useDirectionalLock hook.
 */
export type UseDirectionalLockResult = {
  /** Locked axis, or null if not yet locked */
  lockedAxis: GestureAxis | null;
  /** Whether lock has been determined */
  isLocked: boolean;
  /** Reset the lock state */
  reset: () => void;
};

/**
 * Options for useScrollBoundary hook.
 */
export type UseScrollBoundaryOptions = {
  /** Scroll container ref. If null, checks document scroll. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Axis to monitor */
  axis: GestureAxis;
  /** Tolerance in pixels for "at boundary" detection. @default 1 */
  tolerance?: number;
};

/**
 * Result from useScrollBoundary hook.
 */
export type UseScrollBoundaryResult = {
  /** Whether at the start boundary (top/left) */
  atStart: boolean;
  /** Whether at the end boundary (bottom/right) */
  atEnd: boolean;
  /** Current scroll position */
  scrollPosition: number;
  /** Maximum scroll position */
  maxScrollPosition: number;
};

/**
 * Filter function to determine if a pointer event should start tracking.
 * Receives the pointer event and container element.
 * Return true to allow tracking, false to ignore the event.
 */
export type PointerStartFilter = (
  event: React.PointerEvent,
  container: HTMLElement,
) => boolean;

/**
 * Options for useSwipeInput hook.
 */
export type UseSwipeInputOptions = {
  /** Ref to the container element */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Axis to detect swipes on */
  axis: GestureAxis;
  /** Whether swipe detection is enabled. @default true */
  enabled?: boolean;
  /** Swipe thresholds configuration */
  thresholds?: Partial<SwipeInputThresholds>;
  /** Callback when swipe is completed */
  onSwipeEnd?: (state: SwipeInputState) => void;
  /** Whether to enable trackpad two-finger swipe (wheel events). @default true */
  enableWheel?: boolean;
  /**
   * Optional filter to determine if a pointer event should start tracking.
   * If provided, only events that pass this filter will be tracked.
   * Useful for edge-based swipe detection.
   */
  pointerStartFilter?: PointerStartFilter;
};

/**
 * Result from useSwipeInput hook.
 */
export type UseSwipeInputResult = {
  /** Current swipe input state */
  state: SwipeInputState;
  /** Props to spread on the container element */
  containerProps: React.HTMLAttributes<HTMLElement> & {
    style: React.CSSProperties;
  };
};

/**
 * Edge for edge-originated gestures.
 */
export type GestureEdge = "left" | "right" | "top" | "bottom";

/**
 * Options for useEdgeSwipeInput hook.
 */
export type UseEdgeSwipeInputOptions = {
  /** Ref to the container element */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Which edge to detect swipes from */
  edge: GestureEdge;
  /** Width of the edge detection zone in pixels. @default 20 */
  edgeWidth?: number;
  /** Whether edge swipe detection is enabled. @default true */
  enabled?: boolean;
  /** Swipe thresholds configuration */
  thresholds?: Partial<SwipeInputThresholds>;
  /** Callback when edge swipe is completed */
  onSwipeEnd?: (state: SwipeInputState) => void;
};

/**
 * Result from useEdgeSwipeInput hook.
 */
export type UseEdgeSwipeInputResult = {
  /** Whether the current gesture started from the edge */
  isEdgeGesture: boolean;
  /** Current swipe input state */
  state: SwipeInputState;
  /** Props to spread on the container element */
  containerProps: React.HTMLAttributes<HTMLElement> & {
    style: React.CSSProperties;
  };
};

/**
 * Options for useNativeGestureGuard hook.
 */
export type UseNativeGestureGuardOptions = {
  /** Ref to the container element */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Whether the guard is active */
  active: boolean;
  /** Prevent iOS/macOS edge back gesture. @default true */
  preventEdgeBack?: boolean;
  /** Prevent overscroll bounce effect. @default true */
  preventOverscroll?: boolean;
  /** Width of edge zone where back gesture is prevented. @default 20 */
  edgeWidth?: number;
};

/**
 * Result from useNativeGestureGuard hook.
 */
export type UseNativeGestureGuardResult = {
  /** Props to spread on the container element */
  containerProps: React.HTMLAttributes<HTMLElement> & {
    style: React.CSSProperties;
  };
};

/**
 * Default swipe input thresholds.
 *
 * - distanceThreshold: 100px is ~27% of a 375px mobile screen
 * - velocityThreshold: 0.5px/ms = 500px/s, a moderate flick speed
 * - lockThreshold: 10px before direction is locked
 */
export const DEFAULT_SWIPE_THRESHOLDS: SwipeInputThresholds = {
  distanceThreshold: 100,
  velocityThreshold: 0.5,
  lockThreshold: 10,
};

/**
 * Default edge width for edge gesture detection.
 */
export const DEFAULT_EDGE_WIDTH = 20;

/**
 * Initial idle state for SwipeInputState.
 */
export const IDLE_SWIPE_INPUT_STATE: SwipeInputState = {
  phase: "idle",
  displacement: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  direction: 0,
};
