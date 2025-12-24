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
import { useAnimatedVisibility } from "../../hooks/useAnimatedVisibility";

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
 * When transitionMode="css": Applies enter/leave animations with display:none when hidden.
 * When transitionMode="none": Uses React.Activity for memory optimization.
 */
export const PivotContent: React.FC<PivotContentProps> = React.memo(({ id, isActive, transitionMode, children }) => {
  const visibility = useAnimatedVisibility({
    isVisible: isActive,
    leaveAnimation: transitionMode === "css" ? PIVOT_ANIMATION_LEAVE : undefined,
    skipAnimation: transitionMode !== "css",
  });

  const style = React.useMemo<React.CSSProperties>(() => {
    const s: React.CSSProperties = {
      ...baseStyle,
      ...visibility.style,
      pointerEvents: isActive ? "auto" : "none",
    };

    if (transitionMode === "css") {
      s.animation = isActive ? PIVOT_ANIMATION_ENTER : PIVOT_ANIMATION_LEAVE;
    }

    return s;
  }, [isActive, transitionMode, visibility.style]);

  const content = (
    <div
      data-pivot-content={id}
      data-active={isActive ? "true" : "false"}
      style={style}
      {...visibility.props}
    >
      {children}
    </div>
  );

  if (transitionMode === "none") {
    return <React.Activity mode={isActive ? "visible" : "hidden"}>{content}</React.Activity>;
  }

  return content;
});
