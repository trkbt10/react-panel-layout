/**
 * @file useContainerScroll - Track scroll position of a container or document
 *
 * Tracks scroll position for either a specific scroll container element
 * or the document (when container is null).
 */
import * as React from "react";

export type ScrollPosition = {
  /** Vertical scroll position */
  scrollTop: number;
  /** Horizontal scroll position */
  scrollLeft: number;
};

/**
 * Track scroll position of a container element or the document.
 *
 * @param container - Scroll container element, or null for document scroll
 * @returns Current scroll position
 *
 * @example
 * ```tsx
 * // For document scroll
 * const scroll = useContainerScroll(null);
 *
 * // For container scroll
 * const containerRef = useRef<HTMLDivElement>(null);
 * const scroll = useContainerScroll(containerRef.current);
 * ```
 */
export function useContainerScroll(container: HTMLElement | null): ScrollPosition {
  const [position, setPosition] = React.useState<ScrollPosition>(() => {
    if (typeof window === "undefined") {
      return { scrollTop: 0, scrollLeft: 0 };
    }

    if (container) {
      return {
        scrollTop: container.scrollTop,
        scrollLeft: container.scrollLeft,
      };
    }

    return {
      scrollTop: window.scrollY,
      scrollLeft: window.scrollX,
    };
  });

  React.useEffect(() => {
    const handleScroll = () => {
      if (container) {
        setPosition({
          scrollTop: container.scrollTop,
          scrollLeft: container.scrollLeft,
        });
      } else {
        setPosition({
          scrollTop: window.scrollY,
          scrollLeft: window.scrollX,
        });
      }
    };

    // Initialize position
    handleScroll();

    const target = container ?? window;
    target.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      target.removeEventListener("scroll", handleScroll);
    };
  }, [container]);

  return position;
}
