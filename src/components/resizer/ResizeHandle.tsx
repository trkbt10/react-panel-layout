/**
 * @file Resize handle component
 */
import * as React from "react";
import styles from "./ResizeHandle.module.css";
import { useResizeDrag } from "../../modules/resizer/useResizeDrag";

export type ResizeHandleProps = {
  /** Direction of resize */
  direction: "horizontal" | "vertical";
  /** Callback when resize occurs */
  onResize?: (delta: number) => void;
  /** Custom component for the handle */
  component?: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }>;
  /** Custom element for the handle */
  element?: React.ReactElement;
};

/**
 * ResizeHandle - Draggable handle for resizing grid areas
 */
export const ResizeHandle: React.FC<ResizeHandleProps> = ({ direction, onResize, component: Component, element }) => {
  const axis = direction === "vertical" ? "x" : "y";
  const { ref, isDragging, onPointerDown } = useResizeDrag<HTMLDivElement>({ axis, onResize });

  const handleProps = {
    ref,
    className: styles.resizeHandle,
    "data-resize-handle": "true",
    "data-direction": direction,
    "data-is-dragging": isDragging ? "true" : undefined,
    onPointerDown,
  };

  if (element) {
    return React.cloneElement(element, handleProps);
  }
  if (Component) {
    return <Component {...handleProps} />;
  }
  return <div {...handleProps} />;
};
