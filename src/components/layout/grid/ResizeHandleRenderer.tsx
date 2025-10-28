/**
 * @file Internal renderer for grid resize handles.
 */
import * as React from "react";
import { ResizeHandle } from "../../panels/ResizeHandle";
import styles from "./GridLayout.module.css";
import type { TrackDirection } from "./trackTemplates";

type ResizeHandleRendererProps = {
  direction: TrackDirection;
  trackIndex: number;
  align: "start" | "end";
  gap: number;
  onResize: (direction: TrackDirection, index: number, delta: number) => void;
};

const HANDLE_THICKNESS = 4;

export const ResizeHandleRenderer: React.FC<ResizeHandleRendererProps> = ({
  direction,
  trackIndex,
  align,
  gap,
  onResize,
}) => {
  const resizeDirection = direction === "col" ? "vertical" : "horizontal";

  const handleResize = React.useCallback(
    (delta: number) => {
      onResize(direction, trackIndex, delta);
    },
    [direction, trackIndex, onResize],
  );

  const wrapperClass = direction === "col" ? styles.resizeHandleWrapperVertical : styles.resizeHandleWrapperHorizontal;
  const placementStyle = React.useMemo<React.CSSProperties>(() => {
    if (direction === "col") {
      return {
        gridColumn: `${trackIndex + 1} / ${trackIndex + 2}`,
        gridRow: "1 / -1",
      };
    }
    return {
      gridRow: `${trackIndex + 1} / ${trackIndex + 2}`,
      gridColumn: "1 / -1",
    };
  }, [direction, trackIndex]);

  const wrapperStyle = React.useMemo<React.CSSProperties>(() => {
    const halfGap = Math.max(0, gap) / 2;
    const offset = halfGap + HANDLE_THICKNESS / 2;

    if (direction === "col") {
      return {
        width: HANDLE_THICKNESS,
        top: 0,
        bottom: 0,
        ...(align === "start" ? { left: -offset } : { right: -offset }),
      };
    }

    return {
      height: HANDLE_THICKNESS,
      left: 0,
      right: 0,
      ...(align === "start" ? { top: -offset } : { bottom: -offset }),
    };
  }, [align, direction, gap]);

  return (
    <div data-resizable="true" style={{ ...placementStyle, position: "relative", pointerEvents: "none" }}>
      <div className={wrapperClass} data-direction={resizeDirection} data-align={align} data-handle="true" style={wrapperStyle}>
        <ResizeHandle direction={resizeDirection} onResize={handleResize} />
      </div>
    </div>
  );
};
