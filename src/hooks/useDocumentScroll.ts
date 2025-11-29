/**
 * @file useDocumentScroll - Track document scroll position
 *
 * Provides the current vertical scroll position of the document.
 * Returns negative values during overscroll/bounce on iOS Safari and PWAs.
 */
import * as React from "react";

/**
 * Track document scroll position.
 *
 * @returns Current vertical scroll position (scrollY).
 *          Returns negative values during overscroll/bounce.
 *
 * @example
 * ```tsx
 * const scrollY = useDocumentScroll();
 * // scrollY < 0 during overscroll (pull-down bounce)
 * ```
 */
export function useDocumentScroll(): number {
  const [scrollY, setScrollY] = React.useState(() => {
    if (typeof window === "undefined") {
      return 0;
    }
    return window.scrollY;
  });

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollY;
}
