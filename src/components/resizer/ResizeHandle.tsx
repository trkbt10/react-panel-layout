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
};

/**
 * ResizeHandle - Draggable handle for resizing grid areas
 */
export const ResizeHandle: React.FC<ResizeHandleProps> = ({ direction, onResize }) => {
  const axis = direction === "vertical" ? "x" : "y";
  const { ref, isDragging, onPointerDown } = useResizeDrag<HTMLDivElement>({ axis, onResize });

  return (
    <div
      ref={ref}
      className={styles.resizeHandle}
      data-resize-handle="true"
      data-direction={direction}
      data-is-dragging={isDragging ? "true" : undefined}
      onPointerDown={onPointerDown}
    />
  );
};
