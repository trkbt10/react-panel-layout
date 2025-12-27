/**
 * @file Hook for maintaining value continuity during continuous operations.
 *
 * During operations like swipe gestures, external state (navigation depth, panel roles)
 * may change before the gesture ends. This hook provides a pattern to:
 * - Retain the previous value during the operation for visual continuity
 * - Accept the new value when the operation ends
 * - Track whether the value changed during the operation
 *
 * This is a core primitive for the "operation continuity" pattern used throughout
 * the swipe gesture system.
 */
import * as React from "react";

/**
 * Result from useOperationContinuity hook.
 */
export type UseOperationContinuityResult<T> = {
  /** The effective value (retained during operation, current after) */
  value: T;
  /**
   * True if the value changed during the operation.
   *
   * This is useful for determining how to handle the transition when the
   * operation ends. For example, if the role changed during a swipe,
   * the target position change at operation end should snap rather than animate.
   *
   * This flag is true on the render where shouldRetainPrevious becomes false
   * (operation end), allowing consumers to handle the transition appropriately.
   * It resets to false on subsequent renders.
   */
  changedDuringOperation: boolean;
};

/**
 * Hook for maintaining value continuity during continuous operations.
 *
 * When an operation is in progress, this hook retains the previous value
 * to prevent sudden visual changes from state updates. Once the operation
 * ends (shouldRetainPrevious becomes false), the new value is accepted.
 *
 * Additionally, this hook tracks whether the value changed during the operation,
 * which is useful for determining animation behavior at operation end.
 *
 * @param value - The current value from external state
 * @param shouldRetainPrevious - Whether to retain the previous value (true during operation)
 * @returns Object with effective value and whether it changed during operation
 *
 * @example
 * ```tsx
 * // Maintain role continuity during swipe
 * const { value: effectiveRole, changedDuringOperation } = useOperationContinuity(
 *   role,
 *   displacement > 0,
 * );
 *
 * // Use changedDuringOperation to skip animation on operation end
 * useSwipeContentTransform({
 *   // ...
 *   skipTargetChangeAnimation: changedDuringOperation,
 * });
 * ```
 */
export function useOperationContinuity<T>(
  value: T,
  shouldRetainPrevious: boolean,
): UseOperationContinuityResult<T> {
  const prevValueRef = React.useRef(value);
  const changedDuringRetentionRef = React.useRef(false);

  if (!shouldRetainPrevious) {
    // Not retaining - accept new value
    // Return whether value changed during the retention period
    const changed = changedDuringRetentionRef.current;
    // Reset for next retention period
    changedDuringRetentionRef.current = false;
    prevValueRef.current = value;
    return { value, changedDuringOperation: changed };
  }

  // Retaining - check if value changed from what we're retaining
  if (value !== prevValueRef.current) {
    changedDuringRetentionRef.current = true;
  }

  return {
    value: prevValueRef.current,
    changedDuringOperation: changedDuringRetentionRef.current,
  };
}
