/**
 * @file Helper utilities for computing layer styles in the grid layout.
 */
import type { CSSProperties } from "react";
import type { LayerDefinition } from "../../../panels";

type LayerPosition = {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
};

const getPositionModeStyle = (positionMode?: LayerDefinition["positionMode"]): CSSProperties => {
  const mode = positionMode ?? "grid";
  return { position: mode === "grid" ? "relative" : mode };
};

const getGridAreaStyle = (layer: LayerDefinition): CSSProperties => {
  const mode = layer.positionMode ?? "grid";
  if (mode !== "grid") {
    return {};
  }
  return {
    gridArea: layer.gridArea,
    gridRow: layer.gridRow,
    gridColumn: layer.gridColumn,
  };
};

const getAbsolutePositionStyle = (position?: LayerPosition): CSSProperties => {
  if (!position) {
    return {};
  }

  return {
    top: position.top,
    right: position.right,
    bottom: position.bottom,
    left: position.left,
  };
};

const getZIndexStyle = (zIndex?: number): CSSProperties => {
  return zIndex !== undefined ? { zIndex } : {};
};

const getDimensionsStyle = (width?: number | string, height?: number | string): CSSProperties => {
  return {
    width,
    height,
  };
};

const getPointerEventsStyle = (layer: LayerDefinition): CSSProperties => {
  const mode = layer.positionMode ?? "grid";

  if (layer.pointerEvents !== undefined) {
    if (typeof layer.pointerEvents === "boolean") {
      return { pointerEvents: layer.pointerEvents ? "auto" : "none" };
    }
    return { pointerEvents: layer.pointerEvents };
  }
  if (mode === "absolute" || mode === "fixed") {
    return { pointerEvents: "auto" };
  }

  return {};
};

/**
 * Compute the base style object for a layer definition.
 */
export const buildLayerStyleObject = (layer: LayerDefinition): CSSProperties => {
  return {
    ...layer.style,
    ...getPositionModeStyle(layer.positionMode),
    ...getGridAreaStyle(layer),
    ...getAbsolutePositionStyle(layer.position),
    ...getZIndexStyle(layer.zIndex),
    ...getDimensionsStyle(layer.width, layer.height),
    ...getPointerEventsStyle(layer),
  };
};
