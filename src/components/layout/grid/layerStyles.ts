/**
 * @file Helper utilities for computing layer styles in the grid layout.
 */
import type { CSSProperties } from "react";
import type { LayerDefinition, WindowPosition } from "../../../panels";

const resolvePositionMode = (layer: LayerDefinition): LayerDefinition["positionMode"] => {
  if (layer.positionMode) {
    return layer.positionMode;
  }
  if (layer.floating) {
    const floatingMode = layer.floating.mode ?? "embedded";
    return floatingMode === "embedded" ? "absolute" : "relative";
  }
  return "grid";
};

const getPositionModeStyle = (mode: LayerDefinition["positionMode"]): CSSProperties => {
  return { position: mode === "grid" ? "relative" : mode };
};

const getGridAreaStyle = (layer: LayerDefinition, mode: LayerDefinition["positionMode"]): CSSProperties => {
  if (mode !== "grid") {
    return {};
  }
  return {
    gridArea: layer.gridArea,
    gridRow: layer.gridRow,
    gridColumn: layer.gridColumn,
  };
};

const getAbsolutePositionStyle = (position?: WindowPosition | LayerDefinition["position"]): CSSProperties => {
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

const getPointerEventsStyle = (layer: LayerDefinition, mode: LayerDefinition["positionMode"]): CSSProperties => {
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

const resolveEffectivePosition = (layer: LayerDefinition): WindowPosition | LayerDefinition["position"] | undefined => {
  if (layer.floating) {
    return layer.floating.bounds.position;
  }
  return layer.position;
};

const resolveEffectiveSize = (
  layer: LayerDefinition,
): {
  width?: number | string;
  height?: number | string;
} => {
  if (layer.floating) {
    return {
      width: layer.floating.bounds.size.width,
      height: layer.floating.bounds.size.height,
    };
  }
  return {
    width: layer.width,
    height: layer.height,
  };
};

const resolveEffectiveZIndex = (layer: LayerDefinition): number | undefined => {
  if (layer.floating && layer.floating.zIndex !== undefined) {
    return layer.floating.zIndex;
  }
  return layer.zIndex;
};

/**
 * Compute the base style object for a layer definition.
 */
export const buildLayerStyleObject = (layer: LayerDefinition): CSSProperties => {
  const resolvedMode = resolvePositionMode(layer);
  const effectivePosition = resolveEffectivePosition(layer);
  const effectiveSize = resolveEffectiveSize(layer);
  const effectiveZIndex = resolveEffectiveZIndex(layer);

  return {
    ...layer.style,
    ...getPositionModeStyle(resolvedMode),
    ...getGridAreaStyle(layer, resolvedMode),
    ...getAbsolutePositionStyle(effectivePosition),
    ...getZIndexStyle(effectiveZIndex),
    ...getDimensionsStyle(effectiveSize.width, effectiveSize.height),
    ...getPointerEventsStyle(layer, resolvedMode),
  };
};
