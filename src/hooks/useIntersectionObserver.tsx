/**
 * @file Shared useIntersectionObserver hook with cached observer instances.
 */
import * as React from "react";

const createIdGenerator = () => {
  const map = new Map<object, number>();
  return (ref: object | null | undefined) => {
    if (!ref) {
      return undefined;
    }
    const existing = map.get(ref);
    if (existing !== undefined) {
      return existing;
    }
    const nextId = map.size;
    map.set(ref, nextId);
    return nextId;
  };
};

const getId = createIdGenerator();
type Unobserve = () => void;
type Callback = (entry: IntersectionObserverEntry) => void;
type SharedObserver = {
  observe: (target: Element, callback: Callback) => Unobserve;
};
const observerCache = new Map<string, SharedObserver>();
const getSharedObserver = (options: IntersectionObserverInit) => {
  const observerKey = `ovs-threshold:${options.threshold}-rootMargin:${options.rootMargin}-root:${getId(options.root)}`;

  if (observerCache.has(observerKey)) {
    return observerCache.get(observerKey)!;
  }
  const observer = new (class {
    #callbackMap = new Map<Element, Callback>();
    #intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const callback = this.#callbackMap.get(entry.target);
        if (callback) {
          callback(entry);
        }
      });
    }, options);
    observe(target: Element, callback: Callback) {
      this.#callbackMap.set(target, callback);
      this.#intersectionObserver.observe(target);
      return () => {
        this.#callbackMap.delete(target);
        this.#intersectionObserver.unobserve(target);
      };
    }
  })();
  observerCache.set(observerKey, observer);

  return observer;
};
const voidClientRect = Object.freeze({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}) as DOMRectReadOnly;
/**
 * Observe intersection changes for a given element reference using shared observers.
 *
 * @param ref - Ref holding the element to observe.
 * @param options - Intersection observer configuration.
 * @returns Latest intersection entry snapshot with sensible defaults.
 */
export function useIntersectionObserver<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  { threshold = 0, rootMargin = "0px", root = null }: IntersectionObserverInit,
): {
  readonly boundingClientRect: DOMRectReadOnly;
  readonly intersectionRatio: number;
  readonly intersectionRect: DOMRectReadOnly;
  readonly isIntersecting: boolean;
  readonly rootBounds: DOMRectReadOnly | null;
  readonly target: Element | null;
  readonly time: DOMHighResTimeStamp;
} {
  const [intersection, setIntersection] = React.useState<IntersectionObserverEntry | null>(null);

  React.useEffect(() => {
    const target = ref.current;
    if (!target) {
      return;
    }

    const observer = getSharedObserver({
      threshold,
      rootMargin,
      root,
    });

    return observer.observe(target, (entry) => {
      setIntersection({
        isIntersecting: entry.isIntersecting,
        boundingClientRect: entry.boundingClientRect,
        intersectionRatio: entry.intersectionRatio,
        intersectionRect: entry.intersectionRect,
        rootBounds: entry.rootBounds,
        target: entry.target,
        time: entry.time,
      });
    });
  }, [ref, threshold, rootMargin, root]);

  return React.useMemo(() => {
    return {
      isIntersecting: intersection?.isIntersecting ?? false,
      boundingClientRect: intersection?.boundingClientRect ?? voidClientRect,
      intersectionRatio: intersection?.intersectionRatio ?? 0,
      intersectionRect: intersection?.intersectionRect ?? voidClientRect,
      rootBounds: intersection?.rootBounds ?? null,
      target: intersection?.target ?? ref.current,
      time: intersection?.time ?? 0,
    };
  }, [intersection, ref]);
}
