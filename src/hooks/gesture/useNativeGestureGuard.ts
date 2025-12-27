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
 * - Dynamically applies overscroll-behavior: none to html element during gesture
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

  // Track previous html overscroll-behavior value for restoration
  const previousHtmlOverscrollRef = React.useRef<string | null>(null);

  // Apply overscroll-behavior to html synchronously (called from onPointerDown)
  const applyHtmlOverscroll = React.useCallback(() => {
    if (!preventOverscroll) {
      return;
    }

    const html = document.documentElement;
    if (previousHtmlOverscrollRef.current === null) {
      previousHtmlOverscrollRef.current = html.style.overscrollBehavior;
    }
    html.style.overscrollBehavior = "none";
  }, [preventOverscroll]);

  // Remove overscroll-behavior from html when gesture ends
  React.useEffect(() => {
    if (active || !preventOverscroll) {
      return;
    }

    // Cleanup: restore previous value when deactivated
    if (previousHtmlOverscrollRef.current !== null) {
      document.documentElement.style.overscrollBehavior = previousHtmlOverscrollRef.current;
      previousHtmlOverscrollRef.current = null;
    }
  }, [active, preventOverscroll]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (previousHtmlOverscrollRef.current !== null) {
        document.documentElement.style.overscrollBehavior = previousHtmlOverscrollRef.current;
        previousHtmlOverscrollRef.current = null;
      }
    };
  }, []);

  // Pointer down handler that prevents edge back gesture
  // Note: This must run on EVERY pointerdown in edge zone, not just when active,
  // because browser gesture recognition starts immediately on first touch.
  const onPointerDown = React.useCallback((event: React.PointerEvent) => {
    if (!preventEdgeBack) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Prevent for touch events in the left edge zone
    // This must happen immediately, before we know if it's "our" gesture
    if (event.pointerType === "touch" && isInLeftEdge(event.clientX, container, edgeWidth)) {
      // Apply html overscroll-behavior synchronously before browser can recognize gesture
      applyHtmlOverscroll();
      // Prevent the browser from handling this as a back gesture
      event.preventDefault();
    }
  }, [preventEdgeBack, containerRef, edgeWidth, applyHtmlOverscroll]);

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
