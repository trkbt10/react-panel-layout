/**
 * @file Internal renderer for grid resize handles.
 */
import * as React from "react";
import { ResizeHandle } from "../resizer/ResizeHandle";
import { GRID_HANDLE_THICKNESS } from "../../constants/styles";

type TrackDirection = "row" | "col";

type GridTrackResizeHandleProps = {
  direction: TrackDirection;
  trackIndex: number;
  align: "start" | "end";
  gap: number;
  onResize: (direction: TrackDirection, index: number, delta: number) => void;
};

const resizeHandleWrapperVerticalStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  bottom: 0,
  width: GRID_HANDLE_THICKNESS,
  height: "100%",
  pointerEvents: "auto",
};

const resizeHandleWrapperHorizontalStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  width: "100%",
  height: GRID_HANDLE_THICKNESS,
  pointerEvents: "auto",
};

export const GridTrackResizeHandle: React.FC<GridTrackResizeHandleProps> = ({
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

  const baseWrapperStyle = direction === "col" ? resizeHandleWrapperVerticalStyle : resizeHandleWrapperHorizontalStyle;

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
    const offset = halfGap + GRID_HANDLE_THICKNESS / 2;

    if (direction === "col") {
      return {
        ...baseWrapperStyle,
        width: GRID_HANDLE_THICKNESS,
        top: 0,
        bottom: 0,
        ...(align === "start" ? { left: -offset } : { right: -offset }),
      };
    }

    return {
      ...baseWrapperStyle,
      height: GRID_HANDLE_THICKNESS,
      left: 0,
      right: 0,
      ...(align === "start" ? { top: -offset } : { bottom: -offset }),
    };
  }, [align, direction, gap, baseWrapperStyle]);

  return (
    <div data-resizable="true" style={{ ...placementStyle, position: "relative", pointerEvents: "none" }}>
      <div data-direction={resizeDirection} data-align={align} data-handle="true" style={wrapperStyle}>
        <ResizeHandle direction={resizeDirection} onResize={handleResize} />
      </div>
    </div>
  );
};
