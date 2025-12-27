/**
 * @file useScrollContainer - Detect the nearest scrollable ancestor
 *
 * Traverses the DOM tree to find the nearest ancestor with overflow: scroll/auto.
 * Returns null if the document is the scroll container.
 */
import * as React from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Check if an element is a scroll container.
 */
function isScrollContainer(element: Element): boolean {
  const style = getComputedStyle(element);
  const overflowY = style.overflowY;
  const overflowX = style.overflowX;

  return overflowY === "scroll" || overflowY === "auto" || overflowX === "scroll" || overflowX === "auto";
}

/**
 * Find the nearest scrollable ancestor of an element.
 *
 * @param element - Starting element to search from
 * @returns The nearest scrollable ancestor, or null if document is the container
 */
function findScrollContainer(element: Element | null): HTMLElement | null {
  if (!element) {
    return null;
  }

  // eslint-disable-next-line no-restricted-syntax -- DOM traversal requires let
  let current = element.parentElement;

  while (current) {
    if (isScrollContainer(current)) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}

/**
 * Hook to detect the nearest scrollable ancestor of a ref element.
 *
 * @param ref - Ref to the element to find scroll container for
 * @returns The nearest scrollable ancestor element, or null if document is the container
 *
 * @example
 * ```tsx
 * const elementRef = useRef<HTMLDivElement>(null);
 * const scrollContainer = useScrollContainer(elementRef);
 * // scrollContainer is HTMLElement if in nested scroll, null if document scroll
 * ```
 */
export function useScrollContainer<T extends HTMLElement>(ref: React.RefObject<T | null>): HTMLElement | null {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      setContainer(null);
      return;
    }

    const scrollContainer = findScrollContainer(element);
    setContainer(scrollContainer);
  }, [ref]);

  return container;
}
