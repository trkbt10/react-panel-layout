/**
 * @file PivotContent component for rendering pivot items with CSS animations.
 *
 * Override via CSS custom properties:
 * - --rpl-pivot-animation-enter: Animation when becoming active
 * - --rpl-pivot-animation-leave: Animation when becoming inactive
 *
 * User defines @keyframes in their CSS and references via these tokens.
 * Example:
 *   @keyframes pivotEnter {
 *     from { opacity: 0; }
 *     to { opacity: 1; }
 *   }
 *   :root { --rpl-pivot-animation-enter: pivotEnter 150ms ease-out forwards; }
 */
import * as React from "react";
import { PIVOT_ANIMATION_ENTER, PIVOT_ANIMATION_LEAVE } from "../../constants/styles";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";

export type PivotContentProps = {
  id: string;
  isActive: boolean;
  transitionMode: "css" | "none";
  children: React.ReactNode;
};

const baseStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

/**
 * Renders pivot content with CSS animation support.
 *
 * When transitionMode="css": Applies enter/leave animations.
 * When transitionMode="none": Uses React.Activity for memory optimization.
 */
export const PivotContent: React.FC<PivotContentProps> = React.memo(({ id, isActive, transitionMode, children }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const prevActiveRef = React.useRef(isActive);

  // Restart animation on state change by removing and re-adding animation
  useIsomorphicLayoutEffect(() => {
    if (transitionMode !== "css" || !ref.current) {
      return;
    }

    const el = ref.current;
    const wasActive = prevActiveRef.current;
    prevActiveRef.current = isActive;

    // Only restart if state actually changed
    if (wasActive === isActive) {
      return;
    }

    // Force animation restart: remove animation, trigger reflow, re-add
    el.style.animation = "none";
    void el.offsetHeight; // Force reflow
    el.style.animation = "";
  }, [isActive, transitionMode]);

  const style = React.useMemo<React.CSSProperties>(() => {
    const s: React.CSSProperties = {
      ...baseStyle,
      pointerEvents: isActive ? "auto" : "none",
      opacity: isActive ? 1 : 0,
    };

    if (transitionMode === "css") {
      s.animation = isActive ? PIVOT_ANIMATION_ENTER : PIVOT_ANIMATION_LEAVE;
    }

    return s;
  }, [isActive, transitionMode]);

  const content = (
    <div ref={ref} data-pivot-content={id} data-active={isActive ? "true" : "false"} style={style}>
      {children}
    </div>
  );

  if (transitionMode === "none") {
    return <React.Activity mode={isActive ? "visible" : "hidden"}>{content}</React.Activity>;
  }

  return content;
});
