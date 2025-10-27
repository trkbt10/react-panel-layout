/**
 * @file Internal renderer for grid resize handles.
 */
import * as React from "react";
import { ResizeHandle } from "../../panels/ResizeHandle";
import styles from "./GridLayout.module.css";
import type { TrackDirection } from "./trackTemplates";

type ResizeHandleRendererProps = {
  direction: TrackDirection;
  gridArea: string;
  index: number;
  onResize: (direction: TrackDirection, index: number, delta: number) => void;
};

export const ResizeHandleRenderer: React.FC<ResizeHandleRendererProps> = ({ direction, gridArea, index, onResize }) => {
  const resizeDirection = direction === "col" ? "vertical" : "horizontal";

  const handleResize = React.useCallback(
    (delta: number) => {
      onResize(direction, index, delta);
    },
    [direction, index, onResize],
  );

  return (
    <div data-resizable="true" style={{ gridArea, position: "relative", pointerEvents: "none" }}>
      <div className={direction === "col" ? styles.resizeHandleVertical : styles.resizeHandleHorizontal}>
        <ResizeHandle direction={resizeDirection} onResize={handleResize} />
      </div>
    </div>
  );
};
