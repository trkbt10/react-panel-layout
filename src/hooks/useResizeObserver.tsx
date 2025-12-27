/**
 * @file Shared useResizeObserver hook with cached observer instances.
 *
 * Provides element size observation with shared observers for memory efficiency.
 * Size becomes available after the first useLayoutEffect cycle completes.
 *
 * Note: Due to React's effect execution order (children before parents),
 * child components may see containerSize=0 on their first effect run.
 * This is a React constraint, not a bug. Consumers should check for
 * valid size before using it for calculations like animation positions.
 */
import * as React from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";

/**
 * Shared ResizeObserver that can observe multiple elements.
 */
type SharedObserver = {
  observe: (target: Element, callback: (entry: ResizeObserverEntry) => void) => () => void;
};

/** Cache of shared observers per box option */
const observerCache = new Map<string, SharedObserver>();

/**
 * Get or create a shared ResizeObserver for the given box option.
 */
const getSharedObserver = (box: ResizeObserverBoxOptions): SharedObserver => {
  const observerKey = `resize-box:${box}`;
  const cached = observerCache.get(observerKey);
  if (cached) {
    return cached;
  }

  const callbacks = new Map<Element, (entry: ResizeObserverEntry) => void>();

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const callback = callbacks.get(entry.target);
      if (callback) {
        callback(entry);
      }
    }
  });

  const sharedObserver: SharedObserver = {
    observe(target, callback) {
      callbacks.set(target, callback);
      resizeObserver.observe(target, { box });

      return () => {
        callbacks.delete(target);
        resizeObserver.unobserve(target);
      };
    },
  };

  observerCache.set(observerKey, sharedObserver);
  return sharedObserver;
};

/**
 * Create a ResizeObserverEntry from getBoundingClientRect.
 */
const measureElement = (target: Element): ResizeObserverEntry => {
  const rect = target.getBoundingClientRect();
  return {
    target,
    contentRect: rect,
    borderBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
    contentBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
    devicePixelContentBoxSize: [],
  };
};

/**
 * Extract DOMRect from ResizeObserverEntry.
 */
const entryToRect = (entry: ResizeObserverEntry): DOMRect => {
  if (entry.borderBoxSize?.length > 0) {
    const size = entry.borderBoxSize[0];
    return new DOMRect(0, 0, size.inlineSize, size.blockSize);
  }
  return entry.contentRect;
};

/**
 * Clear observer cache. Exported for testing purposes.
 */
export function clearObserverCache(): void {
  observerCache.clear();
}

/**
 * Observe size changes for a given element reference using shared resize observers.
 *
 * @param ref - Ref holding the element whose size to monitor.
 * @param options - Resize observer configuration.
 * @returns Latest resize entry and a derived DOMRect snapshot.
 *
 * @remarks
 * The `rect` will be `null` on the first render. After the initial
 * useLayoutEffect runs and triggers a re-render, `rect` will contain
 * the measured size.
 *
 * Due to React's effect execution order, child components' effects run
 * before parent effects. If you pass `rect.width` to a child as a prop,
 * the child's first effect will see `0` (or whatever default you use).
 * This is expected React behavior.
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { rect } = useResizeObserver(containerRef, { box: "border-box" });
 * const width = rect?.width ?? 0;
 *
 * // Check if size is ready before using for calculations
 * const isReady = rect !== null;
 * ```
 */
export function useResizeObserver<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  { box = "content-box" }: ResizeObserverOptions,
) {
  const [entry, setEntry] = React.useState<ResizeObserverEntry | null>(null);

  useIsomorphicLayoutEffect(() => {
    const target = ref.current;
    if (!target) {
      setEntry(null);
      return;
    }

    // Measure immediately
    setEntry(measureElement(target));

    // Set up ResizeObserver for subsequent updates
    const observer = getSharedObserver(box);
    return observer.observe(target, setEntry);
  }, [ref, box]);

  const rect = React.useMemo(() => {
    if (!entry) {
      return null;
    }
    return entryToRect(entry);
  }, [entry]);

  return { entry, rect };
}
