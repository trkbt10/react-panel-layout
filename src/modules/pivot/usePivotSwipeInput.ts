/**
 * @file Hook for binding swipe input to Pivot navigation.
 *
 * This hook connects swipe gesture detection to Pivot's navigation API,
 * translating swipe gestures into go(-1) and go(1) calls.
 *
 * Supports both:
 * - Touch/pointer swipe gestures
 * - Trackpad two-finger swipe (wheel events)
 */
import * as React from "react";
import { useSwipeInput } from "../../hooks/gesture/useSwipeInput.js";
import { useNativeGestureGuard } from "../../hooks/gesture/useNativeGestureGuard.js";
import { mergeGestureContainerProps } from "../../hooks/gesture/utils.js";
import type { SwipeInputState, SwipeInputThresholds, GestureAxis } from "../../hooks/gesture/types.js";
import type { UsePivotResult } from "./types.js";

/**
 * Options for usePivotSwipeInput hook.
 */
export type UsePivotSwipeInputOptions = {
  /** Reference to the swipe container element */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Pivot navigation result from usePivot */
  pivot: Pick<UsePivotResult, "go" | "canGo">;
  /** Axis for swipe detection. @default "horizontal" */
  axis?: GestureAxis;
  /** Whether swipe input is enabled. @default true */
  enabled?: boolean;
  /** Custom swipe thresholds */
  thresholds?: Partial<SwipeInputThresholds>;
  /** Whether to enable trackpad wheel swipe. @default true */
  enableWheelSwipe?: boolean;
};

/**
 * Result from usePivotSwipeInput hook.
 */
export type UsePivotSwipeInputResult = {
  /** Current swipe input state */
  inputState: SwipeInputState;
  /** Props to spread on the container element */
  containerProps: React.HTMLAttributes<HTMLElement> & {
    style: React.CSSProperties;
  };
};

/**
 * Hook for binding swipe input to Pivot navigation.
 *
 * Detects horizontal swipe gestures and triggers navigation:
 * - Swipe left (direction -1) → go(1) (next)
 * - Swipe right (direction 1) → go(-1) (prev)
 *
 * Note: The direction mapping is inverted because swiping left reveals the next item,
 * similar to how carousel/swipe navigation works in iOS.
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const pivot = usePivot({ items });
 * const { inputState, containerProps } = usePivotSwipeInput({
 *   containerRef,
 *   pivot,
 * });
 *
 * return (
 *   <div ref={containerRef} {...containerProps}>
 *     <pivot.Outlet />
 *   </div>
 * );
 * ```
 */
export function usePivotSwipeInput(options: UsePivotSwipeInputOptions): UsePivotSwipeInputResult {
  const {
    containerRef,
    pivot,
    axis = "horizontal",
    enabled = true,
    thresholds,
    enableWheelSwipe = true,
  } = options;

  // Track if swiping is active for native gesture guard
  const [isSwipeActive, setIsSwipeActive] = React.useState(false);

  // Handle swipe completion
  const handleSwipeEnd = React.useCallback(
    (state: SwipeInputState) => {
      setIsSwipeActive(false);

      // Invert direction: swipe left (-1) → next (go(1)), swipe right (1) → prev (go(-1))
      const navigationDirection = -state.direction;

      if (navigationDirection !== 0 && pivot.canGo(navigationDirection)) {
        pivot.go(navigationDirection);
      }
    },
    [pivot],
  );

  // Use swipe input detection (handles both pointer and wheel)
  const { state: inputState, containerProps: swipeProps } = useSwipeInput({
    containerRef,
    axis,
    enabled,
    thresholds,
    onSwipeEnd: handleSwipeEnd,
    enableWheel: enableWheelSwipe,
  });

  // Update swipe active state
  React.useEffect(() => {
    const isActive = inputState.phase === "swiping" || inputState.phase === "tracking";
    setIsSwipeActive(isActive);
  }, [inputState.phase]);

  // Use native gesture guard when swiping
  const { containerProps: guardProps } = useNativeGestureGuard({
    containerRef,
    active: isSwipeActive,
    preventEdgeBack: true,
    preventOverscroll: true,
  });

  // Merge container props
  const containerProps = React.useMemo(
    () => mergeGestureContainerProps(swipeProps, guardProps),
    [swipeProps, guardProps],
  );

  return {
    inputState,
    containerProps,
  };
}
