/**
 * @file Context exposing the current grid layer id and helpers to child components.
 */
import * as React from "react";
import type { LayerDefinition } from "../../types";
import { usePanelSystem } from "../../PanelSystemContext";
import { useGridLayoutContext, type GridLayerHandleProps } from "./GridLayoutContext";

type LayerInstanceContextValue = {
  layerId: string;
};

const LayerInstanceContext = React.createContext<LayerInstanceContextValue | null>(null);

export type LayerInstanceProviderProps = React.PropsWithChildren<LayerInstanceContextValue>;

export const LayerInstanceProvider: React.FC<LayerInstanceProviderProps> = ({ layerId, children }) => {
  const value = React.useMemo(() => ({ layerId }), [layerId]);
  return <LayerInstanceContext.Provider value={value}>{children}</LayerInstanceContext.Provider>;
};

export const useLayerInstance = (): LayerInstanceContextValue => {
  const value = React.useContext(LayerInstanceContext);
  if (!value) {
    throw new Error("useLayerInstance must be used within a LayerInstanceProvider.");
  }
  return value;
};

/**
 * Convenience: read the current layer definition from the core registry.
 */
export const useCurrentLayerDefinition = (): LayerDefinition => {
  const { layerId } = useLayerInstance();
  const { layers } = usePanelSystem();
  const def = layers.layerById.get(layerId);
  if (!def) {
    throw new Error(`Layer definition not found for id: ${layerId}`);
  }
  return def;
};

/**
 * Convenience: get drag handle props, pre-bound to the current layer.
 */
export const useCurrentLayerHandleProps = (): GridLayerHandleProps => {
  const { layerId } = useLayerInstance();
  const { getLayerHandleProps } = useGridLayoutContext();
  return React.useMemo(() => getLayerHandleProps(layerId), [getLayerHandleProps, layerId]);
};

/**
 * Compatibility helper for existing code using useLayerDragHandle.
 * Prefer useCurrentLayerHandleProps for direct access.
 */
export const useLayerDragHandleProps = useCurrentLayerHandleProps;
