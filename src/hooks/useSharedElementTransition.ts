/**
 * @file Hook for View Transitions API shared element animations.
 *
 * Enables smooth morph animations between a source element (e.g., card)
 * and a target element (e.g., expanded view) using CSS view-transition-name.
 * Supports swipe-to-dismiss with the expanded view animating back to source.
 */
import * as React from "react";
import { flushSync } from "react-dom";

/**
 * Check if View Transitions API is supported.
 */
export function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

type ViewTransitionHandle = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
};

/**
 * Start a view transition with the given callback.
 */
export function startViewTransition(callback: () => void): ViewTransitionHandle | null {
  if (supportsViewTransitions()) {
    return (document as Document & { startViewTransition: (cb: () => void) => ViewTransitionHandle }).startViewTransition(callback);
  }
  callback();
  return null;
}

/** Default dismiss threshold (30% of viewport height) */
const DEFAULT_DISMISS_THRESHOLD = 0.3;

/** Velocity threshold for quick flick dismissal (px/ms) */
const VELOCITY_THRESHOLD = 0.5;

/**
 * Options for useSharedElementTransition hook.
 */
export type UseSharedElementTransitionOptions<T> = {
  /**
   * Function to generate a unique transition name for an item.
   * Multiple names can be returned for nested shared elements.
   */
  getTransitionName: (item: T) => string | string[];
  /**
   * Function to get a unique key for comparison.
   * Defaults to using getTransitionName result.
   */
  getKey?: (item: T) => string;
  /** Enable swipe to dismiss. @default true */
  swipeDismissible?: boolean;
  /** Threshold ratio (0-1) to trigger dismiss. @default 0.3 */
  dismissThreshold?: number;
};

/** 2D vector */
type Vector2 = { x: number; y: number };

/**
 * Result from useSharedElementTransition hook.
 */
export type UseSharedElementTransitionResult<T> = {
  /** Currently expanded item, or null if none */
  expandedItem: T | null;
  /** Expand an item with view transition */
  expand: (item: T) => void;
  /** Collapse the expanded item with view transition */
  collapse: () => void;
  /**
   * Get style props for a source element (e.g., card).
   */
  getSourceProps: (item: T, nameIndex?: number) => { style: React.CSSProperties };
  /**
   * Get style props for the target element (e.g., expanded view).
   * Includes transform for swipe tracking.
   */
  getTargetProps: (nameIndex?: number) => { style: React.CSSProperties };
  /**
   * Get swipe container props (onPointerDown, style).
   * Apply to the swipeable container element.
   */
  getSwipeContainerProps: () => React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties };
  /** Whether currently being swiped */
  isSwiping: boolean;
  /** Current displacement during swipe */
  displacement: Vector2;
  /** Whether View Transitions API is supported */
  isSupported: boolean;
};

/**
 * Hook for managing shared element transitions using View Transitions API.
 *
 * @example
 * ```tsx
 * const {
 *   expandedItem, expand, collapse,
 *   getSourceProps, getTargetProps, getSwipeContainerProps
 * } = useSharedElementTransition({
 *   getTransitionName: (album) => [`album-${album.id}`, `album-art-${album.id}`],
 * });
 *
 * // Source (card)
 * <div {...getSourceProps(album, 0)}>
 *   <img {...getSourceProps(album, 1)} />
 * </div>
 *
 * // Target (expanded view) - apply swipe props to container
 * {expandedItem && (
 *   <div {...getSwipeContainerProps()}>
 *     <div {...getTargetProps(0)}>
 *       <img {...getTargetProps(1)} />
 *     </div>
 *   </div>
 * )}
 * ```
 */
export function useSharedElementTransition<T>(
  options: UseSharedElementTransitionOptions<T>,
): UseSharedElementTransitionResult<T> {
  const {
    getTransitionName,
    getKey,
    swipeDismissible = true,
    dismissThreshold = DEFAULT_DISMISS_THRESHOLD,
  } = options;

  const [expandedItem, setExpandedItem] = React.useState<T | null>(null);
  // Track which item is about to be expanded (for view transition name assignment)
  const [pendingExpandItem, setPendingExpandItem] = React.useState<T | null>(null);
  // Track which item is collapsing (for view transition name assignment on the card)
  const [collapsingItem, setCollapsingItem] = React.useState<T | null>(null);
  const isSupported = React.useMemo(() => supportsViewTransitions(), []);

  // Swipe tracking state
  const [isSwiping, setIsSwiping] = React.useState(false);
  const [displacement, setDisplacement] = React.useState<Vector2>({ x: 0, y: 0 });
  const startPointRef = React.useRef<Vector2 | null>(null);
  const startTimeRef = React.useRef<number>(0);

  // Get item key for comparison
  const getItemKey = React.useCallback((item: T): string => {
    if (getKey) {
      return getKey(item);
    }
    const names = getTransitionName(item);
    return Array.isArray(names) ? names[0] : names;
  }, [getKey, getTransitionName]);

  const expand = React.useCallback((item: T) => {
    // First, set pending item so only this card gets view-transition-name
    setPendingExpandItem(item);

    // Use requestAnimationFrame to ensure React re-renders before view transition
    requestAnimationFrame(() => {
      const transition = startViewTransition(() => {
        flushSync(() => {
          setExpandedItem(item);
          setPendingExpandItem(null);
        });
      });
      // Fallback if viewTransition not supported
      if (!transition) {
        setExpandedItem(item);
        setPendingExpandItem(null);
      }
    });
  }, []);

  const collapse = React.useCallback(() => {
    if (!expandedItem) return;

    setIsSwiping(false);

    // For closing, expanded view already has view-transition-name
    // We just need the card to also have it in the new state
    // Use flushSync immediately since old state (expanded) already has the name
    const itemToCollapse = expandedItem;
    const transition = startViewTransition(() => {
      flushSync(() => {
        setExpandedItem(null);
        setCollapsingItem(itemToCollapse);
      });
    });

    // Reset states after transition completes (or immediately if not supported)
    if (transition) {
      transition.finished.then(() => {
        setDisplacement({ x: 0, y: 0 });
        setCollapsingItem(null);
      });
    } else {
      setExpandedItem(null);
      setDisplacement({ x: 0, y: 0 });
      setCollapsingItem(null);
    }
  }, [expandedItem]);

  // Pointer event handlers for swipe
  const handlePointerDown = React.useCallback((event: React.PointerEvent) => {
    if (!swipeDismissible || !expandedItem) {
      return;
    }
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    startPointRef.current = { x: event.clientX, y: event.clientY };
    startTimeRef.current = Date.now();
    setIsSwiping(true);
  }, [swipeDismissible, expandedItem]);

  const handlePointerMove = React.useCallback((event: React.PointerEvent) => {
    if (!isSwiping || !startPointRef.current) {
      return;
    }
    const dx = event.clientX - startPointRef.current.x;
    const dy = event.clientY - startPointRef.current.y;
    setDisplacement({ x: dx, y: dy });
  }, [isSwiping]);

  const handlePointerUp = React.useCallback((event: React.PointerEvent) => {
    if (!isSwiping || !startPointRef.current) {
      return;
    }

    const duration = Date.now() - startTimeRef.current;
    const velocity = Math.abs(displacement.y) / Math.max(1, duration);
    const viewportHeight = window.innerHeight;
    const ratio = Math.abs(displacement.y) / viewportHeight;

    // Check if should dismiss (downward swipe)
    const shouldDismiss = displacement.y > 0 && (ratio >= dismissThreshold || velocity >= VELOCITY_THRESHOLD);

    if (shouldDismiss) {
      collapse();
    } else {
      // Snap back
      setDisplacement({ x: 0, y: 0 });
    }

    setIsSwiping(false);
    startPointRef.current = null;
  }, [isSwiping, displacement, dismissThreshold, collapse]);

  const handlePointerCancel = React.useCallback(() => {
    setIsSwiping(false);
    setDisplacement({ x: 0, y: 0 });
    startPointRef.current = null;
  }, []);

  const getSourceProps = React.useCallback(
    (item: T, nameIndex = 0): { style: React.CSSProperties } => {
      const names = getTransitionName(item);
      const nameArray = Array.isArray(names) ? names : [names];
      const name = nameArray[nameIndex];

      const itemKey = getItemKey(item);
      const isThisItemExpanded = expandedItem !== null && getItemKey(expandedItem) === itemKey;
      const isThisItemPending = pendingExpandItem !== null && getItemKey(pendingExpandItem) === itemKey;
      const isThisItemCollapsing = collapsingItem !== null && getItemKey(collapsingItem) === itemKey;

      // Only give view-transition-name to:
      // - The pending item (clicked card, for old state capture during expand)
      // - The collapsing item (card returning to, for new state capture during collapse)
      // - Never to other cards (they don't participate in the transition)
      const shouldHaveTransitionName = isThisItemPending || isThisItemCollapsing;

      return {
        style: {
          viewTransitionName: shouldHaveTransitionName ? name : undefined,
          // Hide the source card when expanded (it's now represented by the target)
          visibility: isThisItemExpanded ? "hidden" : undefined,
        },
      };
    },
    [expandedItem, pendingExpandItem, collapsingItem, getTransitionName, getItemKey],
  );

  const getTargetProps = React.useCallback(
    (nameIndex = 0): { style: React.CSSProperties } => {
      if (expandedItem === null) {
        return { style: {} };
      }

      const names = getTransitionName(expandedItem);
      const nameArray = Array.isArray(names) ? names : [names];
      const name = nameArray[nameIndex];

      // Apply transform during swipe
      const transform = isSwiping || displacement.x !== 0 || displacement.y !== 0
        ? `translate(${displacement.x}px, ${displacement.y}px)`
        : undefined;

      return {
        style: {
          viewTransitionName: name,
          transform,
          transition: !isSwiping ? "transform 0.3s ease-out" : undefined,
        },
      };
    },
    [expandedItem, getTransitionName, isSwiping, displacement],
  );

  const getSwipeContainerProps = React.useCallback((): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } => {
    return {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      style: {
        touchAction: "none",
        userSelect: "none",
      },
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel]);

  return {
    expandedItem,
    expand,
    collapse,
    getSourceProps,
    getTargetProps,
    getSwipeContainerProps,
    isSwiping,
    displacement,
    isSupported,
  };
}
