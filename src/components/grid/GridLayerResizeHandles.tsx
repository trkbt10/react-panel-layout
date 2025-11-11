/**
 * @file Presentational resize handles for floating layers (corner + edge).
 */
import * as React from "react";
import { GRID_LAYER_CORNER_HIT_SIZE, GRID_LAYER_EDGE_HIT_THICKNESS } from "../../constants/styles";

const resizeHandleBaseStyle: React.CSSProperties = {
  position: "absolute",
  pointerEvents: "auto",
  boxSizing: "border-box",
  background: "transparent",
  border: "none",
};

const cornerHandleStyle: React.CSSProperties = {
  ...resizeHandleBaseStyle,
  width: GRID_LAYER_CORNER_HIT_SIZE,
  height: GRID_LAYER_CORNER_HIT_SIZE,
  zIndex: 2,
};

const edgeHandleStyle: React.CSSProperties = {
  ...resizeHandleBaseStyle,
  zIndex: 1,
};

const cornerPositions: Record<string, React.CSSProperties> = {
  "top-left": {
    top: 0,
    left: 0,
    transform: "translate(-50%, -50%)",
    cursor: "nwse-resize",
  },
  "top-right": {
    top: 0,
    right: 0,
    transform: "translate(50%, -50%)",
    cursor: "nesw-resize",
  },
  "bottom-left": {
    bottom: 0,
    left: 0,
    transform: "translate(-50%, 50%)",
    cursor: "nesw-resize",
  },
  "bottom-right": {
    bottom: 0,
    right: 0,
    transform: "translate(50%, 50%)",
    cursor: "nwse-resize",
  },
};

const edgePositions: Record<string, React.CSSProperties> = {
  left: {
    top: GRID_LAYER_CORNER_HIT_SIZE,
    bottom: GRID_LAYER_CORNER_HIT_SIZE,
    left: 0,
    width: GRID_LAYER_EDGE_HIT_THICKNESS,
    transform: "translateX(-50%)",
    cursor: "ew-resize",
  },
  right: {
    top: GRID_LAYER_CORNER_HIT_SIZE,
    bottom: GRID_LAYER_CORNER_HIT_SIZE,
    right: 0,
    width: GRID_LAYER_EDGE_HIT_THICKNESS,
    transform: "translateX(50%)",
    cursor: "ew-resize",
  },
  top: {
    left: GRID_LAYER_CORNER_HIT_SIZE,
    right: GRID_LAYER_CORNER_HIT_SIZE,
    top: 0,
    height: GRID_LAYER_EDGE_HIT_THICKNESS,
    transform: "translateY(-50%)",
    cursor: "ns-resize",
  },
  bottom: {
    left: GRID_LAYER_CORNER_HIT_SIZE,
    right: GRID_LAYER_CORNER_HIT_SIZE,
    bottom: 0,
    height: GRID_LAYER_EDGE_HIT_THICKNESS,
    transform: "translateY(50%)",
    cursor: "ns-resize",
  },
};

export type HorizontalEdge = "left" | "right";
export type VerticalEdge = "top" | "bottom";

export type ResizeHandleConfig =
  | {
      key: "top-left" | "top-right" | "bottom-left" | "bottom-right";
      variant: "corner";
      horizontal: HorizontalEdge;
      vertical: VerticalEdge;
    }
  | {
      key: "left" | "right" | "top" | "bottom";
      variant: "edge";
      horizontal?: HorizontalEdge;
      vertical?: VerticalEdge;
    };

const RESIZE_HANDLE_CONFIGS: ReadonlyArray<ResizeHandleConfig> = [
  { key: "top-left", variant: "corner", horizontal: "left", vertical: "top" },
  { key: "top-right", variant: "corner", horizontal: "right", vertical: "top" },
  { key: "bottom-left", variant: "corner", horizontal: "left", vertical: "bottom" },
  { key: "bottom-right", variant: "corner", horizontal: "right", vertical: "bottom" },
  { key: "left", variant: "edge", horizontal: "left" },
  { key: "right", variant: "edge", horizontal: "right" },
  { key: "top", variant: "edge", vertical: "top" },
  { key: "bottom", variant: "edge", vertical: "bottom" },
];

export type GridLayerResizeHandlesProps = {
  layerId: string;
  onPointerDown: (config: ResizeHandleConfig, event: React.PointerEvent<HTMLDivElement>) => void;
};

export const GridLayerResizeHandles: React.FC<GridLayerResizeHandlesProps> = ({ layerId, onPointerDown }) => {
  return (
    <>
      {RESIZE_HANDLE_CONFIGS.map((config) => {
        const baseStyle = config.variant === "corner" ? cornerHandleStyle : edgeHandleStyle;
        const positionStyle = config.variant === "corner" ? cornerPositions[config.key] : edgePositions[config.key];
        const combinedStyle = { ...baseStyle, ...positionStyle };
        const datasetProps =
          config.variant === "corner" ? { "data-resize-corner": config.key } : { "data-resize-edge": config.key };
        return (
          <div
            key={config.key}
            role="presentation"
            aria-hidden="true"
            style={combinedStyle}
            {...datasetProps}
            data-layer-id={layerId}
            onPointerDown={(event) => onPointerDown(config, event)}
          />
        );
      })}
    </>
  );
};
