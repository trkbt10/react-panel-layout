/**
 * @file Hook for locking gesture direction after threshold is exceeded.
 *
 * Once the user moves beyond the lock threshold, the direction is locked
 * to either horizontal or vertical, preventing diagonal gestures from
 * triggering both scroll and swipe.
 */
import * as React from "react";
import type {
  GestureAxis,
  UseDirectionalLockOptions,
  UseDirectionalLockResult,
} from "./types.js";

const DEFAULT_LOCK_THRESHOLD = 10;

/**
 * Determines which axis the gesture is primarily moving along.
 *
 * @param deltaX - Horizontal displacement from start
 * @param deltaY - Vertical displacement from start
 * @returns The dominant axis, or null if movement is insufficient
 */
const determineAxis = (deltaX: number, deltaY: number): GestureAxis | null => {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  // Require at least some movement in one direction
  if (absX === 0 && absY === 0) {
    return null;
  }

  // Use a 1.5x ratio to ensure clear direction before locking
  // This prevents near-diagonal gestures from locking prematurely
  if (absX > absY * 1.5) {
    return "horizontal";
  }

  if (absY > absX * 1.5) {
    return "vertical";
  }

  // Still ambiguous
  return null;
};

/**
 * Hook for locking gesture direction after threshold is exceeded.
 *
 * This hook tracks pointer movement and locks to horizontal or vertical
 * direction once the movement exceeds the configured threshold. This
 * prevents diagonal gestures from triggering both scroll and swipe behaviors.
 *
 * @example
 * ```tsx
 * const { state: tracking, onPointerDown } = usePointerTracking({ enabled: true });
 * const { lockedAxis, isLocked } = useDirectionalLock({
 *   tracking,
 *   lockThreshold: 10,
 * });
 *
 * // lockedAxis will be "horizontal" or "vertical" once determined
 * ```
 */
export function useDirectionalLock(options: UseDirectionalLockOptions): UseDirectionalLockResult {
  const { tracking, lockThreshold = DEFAULT_LOCK_THRESHOLD } = options;

  const [lockedAxis, setLockedAxis] = React.useState<GestureAxis | null>(null);

  const reset = React.useCallback(() => {
    setLockedAxis(null);
  }, []);

  // Determine direction when tracking is active
  React.useEffect(() => {
    // Reset lock when pointer is released
    if (!tracking.isDown) {
      if (lockedAxis !== null) {
        reset();
      }
      return;
    }

    // Already locked, no need to recalculate
    if (lockedAxis !== null) {
      return;
    }

    // Need start and current positions
    if (!tracking.start || !tracking.current) {
      return;
    }

    const deltaX = tracking.current.x - tracking.start.x;
    const deltaY = tracking.current.y - tracking.start.y;

    // Check if we've exceeded the lock threshold
    const distance = Math.max(Math.abs(deltaX), Math.abs(deltaY));
    if (distance < lockThreshold) {
      return;
    }

    // Try to determine axis
    const axis = determineAxis(deltaX, deltaY);
    if (axis !== null) {
      setLockedAxis(axis);
    }
  }, [tracking.isDown, tracking.start, tracking.current, lockedAxis, lockThreshold, reset]);

  return {
    lockedAxis,
    isLocked: lockedAxis !== null,
    reset,
  };
}
