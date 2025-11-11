/**
 * @file Horizontal divider component
 */
import * as React from "react";
import styles from "./HorizontalDivider.module.css";
import { useResizeDrag } from "../../modules/resizer/useResizeDrag";

export type HorizontalDividerProps = {
  onResize: (deltaX: number) => void;
  /** Custom component for the divider */
  component?: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }>;
  /** Custom element for the divider */
  element?: React.ReactElement;
};

export const HorizontalDivider: React.FC<HorizontalDividerProps> = ({ onResize, component: Component, element }) => {
  const { ref, isDragging, onPointerDown } = useResizeDrag<HTMLDivElement>({
    axis: "x",
    onResize: onResize,
  });

  const dividerProps = {
    ref,
    className: styles.horizontalDivider,
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
