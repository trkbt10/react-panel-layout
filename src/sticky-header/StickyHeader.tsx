/**
 * @file StickyHeader component for native app-like overscroll experience.
 *
 * Displays cover content that expands during overscroll/bounce,
 * providing a native app-like pull effect commonly seen in iOS apps.
 *
 * This component is designed for SPAs, PWAs, and hybrid apps where
 * the browser's pull-to-refresh is disabled and bounce effects
 * should display content rather than empty space.
 *
 * Supports both document-level scroll and nested scroll containers.
 */
import * as React from "react";
import { useContainerScroll } from "../hooks/useContainerScroll";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect";
import { useResizeObserver } from "../hooks/useResizeObserver";
import { useScrollContainer } from "../hooks/useScrollContainer";
import type { StickyHeaderProps, StickyHeaderState } from "./types";

const baseStyle: React.CSSProperties = {
  position: "relative",
};

const headerStyle: React.CSSProperties = {
  position: "relative",
  paddingTop: "env(safe-area-inset-top)",
  boxSizing: "border-box",
};

const bodyStyle: React.CSSProperties = {
  zIndex: 1,
};

/**
 * Get cover styles based on container type.
 */
function getCoverStyle(isDocumentScroll: boolean): React.CSSProperties {
  if (isDocumentScroll) {
    return {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      opacity: 0,
      zIndex: 0,
      userSelect: "none",
      pointerEvents: "none",
    };
  }

  // For nested scroll containers, use absolute positioning
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
    zIndex: 0,
    userSelect: "none",
    pointerEvents: "none",
  };
}

/**
 * Get wrapper styles for nested scroll containers.
 */
function getWrapperStyle(isDocumentScroll: boolean): React.CSSProperties {
  if (isDocumentScroll) {
    return baseStyle;
  }

  return {
    ...baseStyle,
    overflow: "hidden",
  };
}

/**
 * StickyHeader provides a native app-like overscroll experience.
 *
 * When the user pulls down beyond the top of the page (overscroll/bounce),
 * the cover content expands to fill the visible area, similar to
 * native iOS/Android app behavior.
 *
 * Also supports nested scroll containers with overflow: scroll/auto.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <StickyHeader cover={<img src="/hero.jpg" alt="Hero" />}>
 *   <header>
 *     <h1>My App</h1>
 *   </header>
 * </StickyHeader>
 *
 * // With state callback
 * <StickyHeader
 *   cover={<img src="/hero.jpg" alt="Hero" />}
 *   onStateChange={({ isStuck }) => console.log('Stuck:', isStuck)}
 * >
 *   <header>
 *     <h1>My App</h1>
 *   </header>
 * </StickyHeader>
 *
 * // With render function
 * <StickyHeader cover={<img src="/hero.jpg" alt="Hero" />}>
 *   {({ isStuck }) => (
 *     <header style={{ background: isStuck ? 'white' : 'transparent' }}>
 *       <h1>My App</h1>
 *     </header>
 *   )}
 * </StickyHeader>
 * ```
 */
export const StickyHeader: React.FC<StickyHeaderProps> = ({ cover, children, onStateChange }) => {
  const headerRef = React.useRef<HTMLDivElement>(null);
  const coverAreaRef = React.useRef<HTMLDivElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Detect scroll container
  const scrollContainer = useScrollContainer(wrapperRef);
  const isDocumentScroll = scrollContainer === null;

  // Track scroll position
  const { scrollTop } = useContainerScroll(scrollContainer);
  const scrollTopRef = React.useRef(scrollTop);
  scrollTopRef.current = scrollTop;

  // Track header bounds
  const headerBoundRef = React.useRef<DOMRectReadOnly | null>(null);
  const { rect: headerRect } = useResizeObserver(headerRef, {});
  if (!Object.is(headerBoundRef.current, headerRect)) {
    headerBoundRef.current = headerRect;
  }

  // Track container bounds for nested scroll
  const containerBoundRef = React.useRef<DOMRect | null>(null);

  // State for render function and callback
  const [state, setState] = React.useState<StickyHeaderState>({
    isStuck: false,
    scrollOffset: 0,
    containerType: "document",
  });

  // Update state when values change
  const stateRef = React.useRef(state);
  const updateState = React.useCallback(
    (newState: StickyHeaderState) => {
      const prev = stateRef.current;
      if (prev.isStuck !== newState.isStuck || prev.scrollOffset !== newState.scrollOffset || prev.containerType !== newState.containerType) {
        stateRef.current = newState;
        setState(newState);
        onStateChange?.(newState);
      }
    },
    [onStateChange],
  );

  useIsomorphicLayoutEffect(() => {
    const header = headerRef.current;
    const coverArea = coverAreaRef.current;
    const wrapper = wrapperRef.current;
    if (!coverArea || !header || !wrapper) {
      return;
    }

    // eslint-disable-next-line no-restricted-syntax -- Performance: mutable state for RAF loop
    let prevHeight = Number.NaN;
    // eslint-disable-next-line no-restricted-syntax -- Performance: mutable state for RAF loop
    let prevHeaderBound: DOMRectReadOnly | null = null;
    // eslint-disable-next-line no-restricted-syntax -- Performance: mutable state for RAF loop
    let prevIsStuck = false;

    const loop = () => {
      const headerBound = headerBoundRef.current;
      if (!headerBound) {
        return;
      }

      const currentScrollTop = scrollTopRef.current;

      if (isDocumentScroll) {
        // Document scroll mode (original behavior)
        const coverAreaHeight = headerBound.height - currentScrollTop;
        if (coverAreaHeight !== prevHeight) {
          coverArea.style.opacity = "1";
          coverArea.style.height = `${coverAreaHeight}px`;
          prevHeight = coverAreaHeight;
        }

        if ((headerBound.x >= 0 || headerBound.y >= 0 || headerBound.width > 0) && prevHeaderBound !== headerBound) {
          coverArea.style.left = `${headerBound.x}px`;
          coverArea.style.top = `${headerBound.y}px`;
          coverArea.style.width = `${headerBound.width}px`;
          prevHeaderBound = headerBound;
        }

        // Calculate stuck state
        const isStuck = currentScrollTop > 0;
        if (isStuck !== prevIsStuck) {
          prevIsStuck = isStuck;
          updateState({
            isStuck,
            scrollOffset: currentScrollTop,
            containerType: "document",
          });
        }
      } else {
        // Nested container scroll mode
        const container = scrollContainer;
        if (!container) {
          return;
        }

        // Get container bounds
        const containerBound = container.getBoundingClientRect();
        containerBoundRef.current = containerBound;

        // Calculate header position relative to container
        const headerTop = header.getBoundingClientRect().top - containerBound.top + currentScrollTop;

        // Calculate cover height based on scroll position
        const scrollOffset = currentScrollTop - headerTop;
        const coverAreaHeight = Math.max(0, headerBound.height - scrollOffset);

        if (coverAreaHeight !== prevHeight) {
          coverArea.style.opacity = "1";
          coverArea.style.height = `${coverAreaHeight}px`;
          prevHeight = coverAreaHeight;
        }

        // Position cover relative to scroll
        if (prevHeaderBound !== headerBound) {
          coverArea.style.left = "0";
          coverArea.style.width = `${headerBound.width}px`;
          prevHeaderBound = headerBound;
        }

        // Calculate top position to follow scroll
        const coverTop = Math.max(0, scrollOffset);
        coverArea.style.top = `${coverTop}px`;

        // Calculate stuck state
        const isStuck = scrollOffset > 0;
        if (isStuck !== prevIsStuck) {
          prevIsStuck = isStuck;
          updateState({
            isStuck,
            scrollOffset,
            containerType: "container",
          });
        }
      }
    };

    // eslint-disable-next-line no-restricted-syntax -- Performance: RAF id needs reassignment
    let id = requestAnimationFrame(function animate() {
      loop();
      id = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(id);
    };
  }, [isDocumentScroll, scrollContainer, updateState]);

  // Render children
  const renderedChildren = typeof children === "function" ? children(state) : children;

  return (
    <div ref={wrapperRef} style={getWrapperStyle(isDocumentScroll)}>
      <div ref={coverAreaRef} style={getCoverStyle(isDocumentScroll)}>
        {cover}
      </div>
      <div ref={headerRef} style={headerStyle}>
        <div style={bodyStyle}>{renderedChildren}</div>
      </div>
    </div>
  );
};

StickyHeader.displayName = "StickyHeader";
