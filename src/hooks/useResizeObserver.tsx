/**
 * @file Shared useResizeObserver hook with cached observer instances.
 */
import * as React from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";

type Unobserve = () => void;
type Callback = (entry: ResizeObserverEntry, observer: ResizeObserver) => void;
type SharedObserver = {
  observe: (target: Element, callback: Callback) => Unobserve;
};
const observerCache = new Map<string, SharedObserver>();
const getSharedObserver = (options: ResizeObserverOptions) => {
  const { box = "content-box" } = options;
  const observerKey = `resize-box:${box}`;
  const cached = observerCache.get(observerKey);
  if (cached) {
    return cached;
  }
  const observer = new (class {
    #callbackMap = new Map<Element, Callback>();
    #resizeObserver = new ResizeObserver((entries, observer) => {
      entries.forEach((entry) => {
        const callback = this.#callbackMap.get(entry.target);
        if (callback) {
          callback(entry, observer);
        }
      });
    });
    observe(target: Element, callback: Callback) {
      this.#callbackMap.set(target, callback);
      this.#resizeObserver.observe(target, options);
      return () => {
        this.#callbackMap.delete(target);
        this.#resizeObserver.unobserve(target);
      };
    }
  })();
  observerCache.set(observerKey, observer);

  return observer;
};
/**
 * Observe size changes for a given element reference using shared resize observers.
 *
 * @param ref - Ref holding the element whose size to monitor.
 * @param options - Resize observer configuration.
 * @returns Latest resize entry and a derived DOMRect snapshot.
 */
export function useResizeObserver<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  { box }: ResizeObserverOptions,
) {
  const [entry, setEntry] = React.useState<ResizeObserverEntry | null>(null);
  const target = ref.current;

  // Use useIsomorphicLayoutEffect for synchronous execution before paint.
  // This ensures containerSize is available before first animation frame.
  // SSR-safe: falls back to useEffect on server to avoid warnings.
  useIsomorphicLayoutEffect(() => {
    if (!target) {
      return;
    }

    // Immediately measure initial size before ResizeObserver callback fires.
    // This matches the previous inline implementation behavior.
    const initialRect = target.getBoundingClientRect();
    const initialEntry: ResizeObserverEntry = {
      target,
      contentRect: initialRect,
      borderBoxSize: [{ inlineSize: initialRect.width, blockSize: initialRect.height }],
      contentBoxSize: [{ inlineSize: initialRect.width, blockSize: initialRect.height }],
      devicePixelContentBoxSize: [],
    };
    setEntry(initialEntry);

    const observer = getSharedObserver({ box });
    return observer.observe(target, (nextEntry) => {
      setEntry(nextEntry);
    });
  }, [box, target]);

  const rect = React.useMemo(() => {
    if (!entry) {
      return null;
    }

    if (entry.borderBoxSize?.length > 0) {
      const size = entry.borderBoxSize[0];
      return new DOMRect(0, 0, size.inlineSize, size.blockSize);
    }

    return entry.contentRect;
  }, [entry]);

  return { entry, rect };
}
