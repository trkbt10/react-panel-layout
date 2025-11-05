/**
 * @file Horizontal divider component
 */
import * as React from "react";
import styles from "./HorizontalDivider.module.css";
import { useResizeDrag } from "../../modules/resizer/useResizeDrag";

export type HorizontalDividerProps = {
  onResize: (deltaX: number) => void;
};

export const HorizontalDivider: React.FC<HorizontalDividerProps> = ({ onResize }) => {
  const { ref, isDragging, onPointerDown } = useResizeDrag<HTMLDivElement>({
    axis: "x",
    onResize: onResize,
  });

  return (
    <div
      ref={ref}
      className={styles.horizontalDivider}
      data-dragging={isDragging ? "true" : undefined}
      onPointerDown={onPointerDown}
    />
  );
};
