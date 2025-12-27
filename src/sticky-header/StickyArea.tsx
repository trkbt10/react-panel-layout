/**
 * @file StickyArea component for native app-like overscroll experience.
 *
 * Displays cover content that expands during overscroll/bounce,
 * providing a native app-like pull effect commonly seen in iOS apps.
 *
 * Supports both top (header) and bottom (footer) positions.
 * Works with document-level scroll only.
 */
import * as React from "react";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect";
import { calculateStickyMetrics } from "./calculateStickyMetrics";
import type { StickyAreaProps, StickyAreaState } from "./types";

/**
 * Get area styles based on position.
 */
function getAreaStyle(position: "top" | "bottom"): React.CSSProperties {
  return {
    position: "relative",
    paddingTop: position === "top" ? "env(safe-area-inset-top)" : undefined,
    paddingBottom: position === "bottom" ? "env(safe-area-inset-bottom)" : undefined,
    boxSizing: "border-box",
  };
}

const bodyStyle: React.CSSProperties = {
  zIndex: 1,
};

/**
 * Get cover styles based on position.
 * Explicitly disables transitions to prevent jank from inherited CSS.
 */
function getCoverStyle(position: "top" | "bottom"): React.CSSProperties {
  return {
    opacity: 0,
    zIndex: 0,
    userSelect: "none",
    pointerEvents: "none",
    // Disable transitions to prevent jank - styles are updated via RAF
    transition: "none",
    // Enable GPU acceleration for smoother animations
    willChange: "height, opacity",
    transform: "translateZ(0)",
    position: "fixed",
    top: position === "top" ? 0 : undefined,
    bottom: position === "bottom" ? 0 : undefined,
    left: 0,
    right: 0,
  };
}

const wrapperStyle: React.CSSProperties = {
  position: "relative",
};

/**
 * StickyArea provides a native app-like overscroll experience.
 *
 * When the user overscrolls (pulls beyond the edge), the cover content
 * expands to fill the visible area, similar to native iOS/Android app behavior.
 *
 * Supports both top (header) and bottom (footer) positions.
 * Works with document-level scroll only.
 *
 * @example
 * ```tsx
 * // Header (top) - expands on pull-down
 * <StickyArea position="top" cover={<img src="/hero.jpg" />}>
 *   <header><h1>My App</h1></header>
 * </StickyArea>
 *
 * // Footer (bottom) - expands on pull-up
 * <StickyArea position="bottom" cover={<div className="footer-bg" />}>
 *   <footer>Footer content</footer>
 * </StickyArea>
 * ```
 */
export const StickyArea: React.FC<StickyAreaProps> = ({
  position = "top",
  cover,
  children,
  onStateChange,
}) => {
  const areaRef = React.useRef<HTMLDivElement>(null);
  const coverAreaRef = React.useRef<HTMLDivElement>(null);

  // State for render function and callback
  const [state, setState] = React.useState<StickyAreaState>({
    isStuck: false,
    scrollOffset: 0,
  });

  // Update state when values change
  const stateRef = React.useRef(state);
  const updateState = React.useCallback(
    (newState: StickyAreaState) => {
      const prev = stateRef.current;
      if (prev.isStuck !== newState.isStuck || prev.scrollOffset !== newState.scrollOffset) {
        stateRef.current = newState;
        setState(newState);
        onStateChange?.(newState);
      }
    },
    [onStateChange],
  );

  useIsomorphicLayoutEffect(() => {
    const area = areaRef.current;
    const coverArea = coverAreaRef.current;
    if (!coverArea || !area) {
      return;
    }

    // eslint-disable-next-line no-restricted-syntax -- Performance: mutable state for RAF loop
    let prevHeight = Number.NaN;
    // eslint-disable-next-line no-restricted-syntax -- Performance: mutable state for RAF loop
    let prevLeft = Number.NaN;
    // eslint-disable-next-line no-restricted-syntax -- Performance: mutable state for RAF loop
    let prevWidth = Number.NaN;
    // eslint-disable-next-line no-restricted-syntax -- Performance: mutable state for RAF loop
    let prevIsStuck = false;
    // eslint-disable-next-line no-restricted-syntax -- Performance: mutable state for RAF loop
    let isFirstRun = true;

    const loop = () => {
      const liveRect = area.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate metrics using pure function
      const { coverAreaHeight, isStuck, scrollOffset } = calculateStickyMetrics(
        position,
        liveRect,
        viewportHeight
      );

      // Update height/opacity
      if (coverAreaHeight !== prevHeight) {
        coverArea.style.opacity = coverAreaHeight > 0 ? "1" : "0";
        coverArea.style.height = `${coverAreaHeight}px`;
        prevHeight = coverAreaHeight;
      }

      // Update left/width
      if (liveRect.left !== prevLeft || liveRect.width !== prevWidth) {
        coverArea.style.left = `${liveRect.left}px`;
        coverArea.style.width = `${liveRect.width}px`;
        prevLeft = liveRect.left;
        prevWidth = liveRect.width;
      }

      // Update state
      const shouldUpdateState = isFirstRun ? true : isStuck !== prevIsStuck;
      if (shouldUpdateState) {
        isFirstRun = false;
        prevIsStuck = isStuck;
        updateState({ isStuck, scrollOffset });
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
  }, [position, updateState]);

  // Render children
  const renderedChildren = typeof children === "function" ? children(state) : children;

  return (
    <div style={wrapperStyle}>
      <div ref={coverAreaRef} style={getCoverStyle(position)}>
        {cover}
      </div>
      <div ref={areaRef} style={getAreaStyle(position)}>
        <div style={bodyStyle}>{renderedChildren}</div>
      </div>
    </div>
  );
};

StickyArea.displayName = "StickyArea";

/**
 * @deprecated Use StickyArea with position="top" instead
 */
export const StickyHeader = StickyArea;
