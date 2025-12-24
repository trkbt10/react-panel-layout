/**
 * @file Hook for binding edge swipe input to Stack navigation.
 *
 * This hook connects edge swipe gesture detection to Stack's navigation API,
 * enabling iOS-style "swipe to go back" navigation.
 */
import * as React from "react";
import { useEdgeSwipeInput } from "../../hooks/gesture/useEdgeSwipeInput.js";
import { useNativeGestureGuard } from "../../hooks/gesture/useNativeGestureGuard.js";
import type { SwipeInputState } from "../../hooks/gesture/types.js";
import type { UseStackSwipeInputOptions, UseStackSwipeInputResult } from "./types.js";

/**
 * Hook for binding edge swipe input to Stack navigation.
 *
 * Detects swipe gestures from the specified edge and triggers navigation:
 * - Left edge swipe → go(-1) (go back)
 * - Right edge swipe → reveals parent or custom action
 *
 * During a swipe, provides progress for animation.
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const navigation = useStackNavigation({ panels, displayMode: 'overlay' });
 * const { isEdgeSwiping, progress, containerProps } = useStackSwipeInput({
 *   containerRef,
 *   navigation,
 * });
 *
 * return (
 *   <div ref={containerRef} {...containerProps}>
 *     <navigation.Outlet />
 *   </div>
 * );
 * ```
 */
export function useStackSwipeInput(options: UseStackSwipeInputOptions): UseStackSwipeInputResult {
  const {
    containerRef,
    navigation,
    edge = "left",
    edgeWidth = 20,
    enabled = true,
  } = options;

  // Track swipe state for progress calculation
  const [swipeState, setSwipeState] = React.useState<SwipeInputState | null>(null);

  // Handle swipe completion - navigate back
  const handleSwipeEnd = React.useCallback(
    (state: SwipeInputState) => {
      setSwipeState(null);

      // Left edge swipe going right = go back
      if (edge === "left" && state.direction === 1) {
        if (navigation.canGo(-1)) {
          navigation.go(-1);
        }
      }
      // Right edge swipe going left = custom action (optional)
      // Could be used for forward navigation if the app supports it
    },
    [edge, navigation],
  );

  // Use edge swipe detection
  const { isEdgeGesture, state: inputState, containerProps: swipeProps } = useEdgeSwipeInput({
    containerRef,
    edge,
    edgeWidth,
    enabled: enabled && navigation.canGo(-1), // Only enable if can go back
    onSwipeEnd: handleSwipeEnd,
  });

  // Update swipe state for progress tracking
  React.useEffect(() => {
    if (isEdgeGesture && (inputState.phase === "swiping" || inputState.phase === "tracking")) {
      setSwipeState(inputState);
    } else if (inputState.phase === "idle") {
      setSwipeState(null);
    }
  }, [isEdgeGesture, inputState]);

  // Use native gesture guard during swipe
  const { containerProps: guardProps } = useNativeGestureGuard({
    containerRef,
    active: isEdgeGesture,
    preventEdgeBack: true,
    preventOverscroll: true,
    edgeWidth,
  });

  // Calculate swipe progress (0-1)
  const progress = React.useMemo(() => {
    if (!swipeState || !containerRef.current) {
      return 0;
    }

    const containerWidth = containerRef.current.clientWidth;
    if (containerWidth === 0) {
      return 0;
    }

    // Use X displacement for horizontal swipe
    const displacement = swipeState.displacement.x;

    // Only count rightward movement for left edge swipe
    if (edge === "left" && displacement <= 0) {
      return 0;
    }

    // Only count leftward movement for right edge swipe
    if (edge === "right" && displacement >= 0) {
      return 0;
    }

    const absDisplacement = Math.abs(displacement);
    return Math.min(absDisplacement / containerWidth, 1);
  }, [swipeState, containerRef, edge]);

  // Merge container props
  const containerProps = React.useMemo(() => {
    const mergedStyle: React.CSSProperties = {
      ...swipeProps.style,
      ...guardProps.style,
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
      swipeProps.onPointerDown?.(event);
      guardProps.onPointerDown?.(event);
    };

    return {
      onPointerDown: handlePointerDown,
      style: mergedStyle,
    };
  }, [swipeProps, guardProps]);

  return {
    isEdgeSwiping: isEdgeGesture,
    progress,
    containerProps,
  };
}
