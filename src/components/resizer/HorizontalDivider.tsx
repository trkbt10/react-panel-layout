/**
 * @file Horizontal divider component
 */
import * as React from "react";
import { useResizeDrag } from "../../modules/resizer/useResizeDrag";
import { HORIZONTAL_DIVIDER_WIDTH } from "../../constants/styles";

export type HorizontalDividerProps = {
  onResize: (deltaX: number) => void;
  /** Custom component for the divider */
  component?: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }>;
  /** Custom element for the divider */
  element?: React.ReactElement;
};

const horizontalDividerStyle: React.CSSProperties = {
  width: HORIZONTAL_DIVIDER_WIDTH,
  cursor: "col-resize",
  position: "relative",
  userSelect: "none",
};

export const HorizontalDivider: React.FC<HorizontalDividerProps> = ({ onResize, component: Component, element }) => {
  const { ref, isDragging, onPointerDown } = useResizeDrag<HTMLDivElement>({
    axis: "x",
    onResize: onResize,
  });

  const dividerProps = {
    ref,
    style: horizontalDividerStyle,
    role: "separator" as const,
    "aria-orientation": "vertical" as const,
    "data-dragging": isDragging ? "true" : undefined,
    onPointerDown,
  };

  if (element) {
    return React.cloneElement(element, dividerProps);
  }
  if (Component) {
    return <Component {...dividerProps} />;
  }
  return <div {...dividerProps} />;
};
