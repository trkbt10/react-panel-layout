/**
 * @file PanelSystemContext
 *
 * Core provider for panel definitions and registry. Grid-specific layout and
 * interactions are composed by UI layers (e.g., GridLayout) on top of this.
 */
import * as React from "react";
import type { PanelLayoutConfig, LayerDefinition } from "./types";

export type PanelSystemContextValue = {
  config: PanelLayoutConfig;
  style?: React.CSSProperties;
  layers: {
    /** Raw panel definitions (no grid normalization). */
    defs: LayerDefinition[];
    /** Fast lookup map by id for consumers. */
    layerById: Map<string, LayerDefinition>;
  };
};

const PanelSystemContext = React.createContext<PanelSystemContextValue | null>(null);

export const usePanelSystem = (): PanelSystemContextValue => {
  const ctx = React.useContext(PanelSystemContext);
  if (!ctx) {
    throw new Error("usePanelSystem must be used within a PanelSystemProvider.");
  }
  return ctx;
};

export type PanelSystemProviderProps = React.PropsWithChildren<{
  config: PanelLayoutConfig;
  layers: LayerDefinition[];
  style?: React.CSSProperties;
}>;

export const PanelSystemProvider: React.FC<PanelSystemProviderProps> = ({ config, layers, style, children }) => {
  const layerById = React.useMemo(() => {
    const map = new Map<string, LayerDefinition>();
    layers.forEach((layer) => {
      map.set(layer.id, layer);
    });
    return map;
  }, [layers]);

  const value = React.useMemo<PanelSystemContextValue>(
    () => ({
      config,
      style,
      layers: {
        defs: layers,
        layerById,
      },
    }),
    [config, style, layers, layerById],
  );

  return <PanelSystemContext.Provider value={value}>{children}</PanelSystemContext.Provider>;
};
