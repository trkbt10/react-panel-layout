/**
 * @file Horizontal divider component
 */
import * as React from "react";
import { useResizeDrag } from "../../modules/resizer/useResizeDrag";
import { HORIZONTAL_DIVIDER_WIDTH, COLOR_RESIZE_HANDLE_IDLE, COLOR_RESIZE_HANDLE_HOVER, COLOR_RESIZE_HANDLE_ACTIVE } from "../../constants/styles";

export type HorizontalDividerProps = {
  onResize: (deltaX: number) => void;
  /** Custom component for the divider */
  component?: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }>;
  /** Custom element for the divider */
  element?: React.ReactElement;
};

const buildDividerStyle = (state: "idle" | "hover" | "drag"): React.CSSProperties => {
  const backgroundColor = state === "drag" ? COLOR_RESIZE_HANDLE_ACTIVE : state === "hover" ? COLOR_RESIZE_HANDLE_HOVER : COLOR_RESIZE_HANDLE_IDLE;
  return {
    width: HORIZONTAL_DIVIDER_WIDTH,
    cursor: "col-resize",
    position: "relative",
    userSelect: "none",
    backgroundColor,
  };
};

export const HorizontalDivider: React.FC<HorizontalDividerProps> = ({ onResize, component: Component, element }) => {
  const { ref, isDragging, onPointerDown } = useResizeDrag<HTMLDivElement>({
    axis: "x",
    onResize: onResize,
  });
  const [hovered, setHovered] = React.useState(false);

  const dividerProps = {
    ref,
    style: buildDividerStyle(isDragging ? "drag" : hovered ? "hover" : "idle"),
    role: "separator" as const,
    "aria-orientation": "vertical" as const,
    "data-dragging": isDragging ? "true" : undefined,
    onPointerDown,
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => setHovered(false),
  };

  if (element) {
    return React.cloneElement(element, dividerProps);
  }
  if (Component) {
    return <Component {...dividerProps} />;
  }
  return <div {...dividerProps} />;
};
