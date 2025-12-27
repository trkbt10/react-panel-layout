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
  /**
   * True on the render where the operation just ended.
   *
   * This is true when shouldRetainPrevious transitions from true to false,
   * regardless of whether the value changed. Use this to detect the moment
   * when an operation completes and delay any immediate animations.
   *
   * In the over-swipe case, this helps prevent unwanted snap-back animation
   * in the intermediate render before navigation changes.
   */
  operationJustEnded: boolean;
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
 * IMPORTANT: This hook is designed to be idempotent during render to work
 * correctly with React StrictMode, which calls the render function twice.
 * All ref mutations happen in useLayoutEffect, not during render.
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
  // Store previous shouldRetainPrevious to detect transitions
  const prevShouldRetainRef = React.useRef(shouldRetainPrevious);
  // Store retained value (the value at the start of retention)
  const retainedValueRef = React.useRef(value);
  // Track if value changed during retention
  const changedDuringRetentionRef = React.useRef(false);

  // Derive operationJustEnded from transition: true → false
  // This is idempotent - safe for StrictMode double-render
  const wasRetaining = prevShouldRetainRef.current;
  const operationJustEnded = wasRetaining && !shouldRetainPrevious;

  // Check if value diverged from retained value
  // This includes both current-render divergence and previously-tracked divergence
  const valueDiverged = value !== retainedValueRef.current;
  const currentlyDiverged = shouldRetainPrevious && valueDiverged;

  // Derive changedDuringOperation
  // True if:
  // 1. Value diverged during retention (tracked from previous renders via ref)
  // 2. Value diverges right now during retention (immediate comparison)
  // 3. Value diverged at the moment retention ends
  const changedDuringRetention = changedDuringRetentionRef.current || currentlyDiverged;
  const changedAtExit = operationJustEnded && valueDiverged;
  const changedDuringOperation = changedDuringRetention || changedAtExit;

  // Determine effective value
  // During retention: use retained value
  // After retention ends: use current value
  const effectiveValue = shouldRetainPrevious ? retainedValueRef.current : value;

  // Update refs in useLayoutEffect to ensure idempotency during render.
  // This runs once per commit, not per render in StrictMode.
  React.useLayoutEffect(() => {
    if (!shouldRetainPrevious) {
      // Retention ended or never started - reset state
      changedDuringRetentionRef.current = false;
      retainedValueRef.current = value;
    } else {
      // During retention - track if value diverged
      if (currentlyDiverged) {
        changedDuringRetentionRef.current = true;
      }
    }
    prevShouldRetainRef.current = shouldRetainPrevious;
  });

  return {
    value: effectiveValue,
    changedDuringOperation,
    operationJustEnded,
  };
}
