/**
 * @file Hook for preventing conflicts with native OS gestures.
 *
 * This hook helps prevent conflicts with:
 * - iOS/macOS edge swipe back navigation
 * - Overscroll bounce effects
 *
 * It applies appropriate CSS properties and event handlers to the container.
 */
import * as React from "react";
import type {
  UseNativeGestureGuardOptions,
  UseNativeGestureGuardResult,
} from "./types.js";
import { DEFAULT_EDGE_WIDTH } from "./types.js";

/**
 * Check if a pointer event is within the left edge zone.
 */
const isInLeftEdge = (clientX: number, container: HTMLElement, edgeWidth: number): boolean => {
  const rect = container.getBoundingClientRect();
  return clientX >= rect.left && clientX <= rect.left + edgeWidth;
};

/**
 * Hook for preventing conflicts with native OS gestures.
 *
 * When active, this hook:
 * - Prevents iOS/macOS edge back gesture by capturing pointerdown events in the edge zone
 * - Prevents overscroll bounce effect using CSS overscroll-behavior
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { containerProps } = useNativeGestureGuard({
 *   containerRef,
 *   active: isSwipeActive,
 *   preventEdgeBack: true,
 *   preventOverscroll: true,
 * });
 *
 * return <div ref={containerRef} {...containerProps}>{children}</div>;
 * ```
 */
export function useNativeGestureGuard(options: UseNativeGestureGuardOptions): UseNativeGestureGuardResult {
  const {
    containerRef,
    active,
    preventEdgeBack = true,
    preventOverscroll = true,
    edgeWidth = DEFAULT_EDGE_WIDTH,
  } = options;

  // Pointer down handler that prevents edge back gesture
  const onPointerDown = React.useCallback((event: React.PointerEvent) => {
    if (!active || !preventEdgeBack) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Only prevent for touch events in the left edge zone
    if (event.pointerType === "touch" && isInLeftEdge(event.clientX, container, edgeWidth)) {
      // Prevent the browser from handling this as a back gesture
      // This works by setting pointer capture which prevents the browser's gesture recognizer
      // from taking over the touch
      event.preventDefault();
    }
  }, [active, preventEdgeBack, containerRef, edgeWidth]);

  // Build container props
  // Styles are applied immediately (not waiting for active) to prevent browser gestures
  const containerProps = React.useMemo(() => {
    const style: React.CSSProperties = {
      // Always apply to prevent browser navigation gestures
      overscrollBehavior: preventOverscroll ? "contain" : undefined,
      WebkitOverflowScrolling: "touch",
    };

    return {
      onPointerDown: preventEdgeBack ? onPointerDown : undefined,
      style,
    };
  }, [preventOverscroll, preventEdgeBack, onPointerDown]);

  return {
    containerProps,
  };
}
