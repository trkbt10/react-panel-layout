/**
 * @file PanelSystemContext
 *
 * Core provider for panel definitions and registry. Grid-specific layout and
 * interactions are composed by UI layers (e.g., GridLayout) on top of this.
 *
 * Includes content caching to preserve React component state across re-renders.
 * This is essential for maintaining internal state when parent components
 * re-create the layers array.
 */
import * as React from "react";
import type { PanelLayoutConfig, LayerDefinition } from "./types";
import { useContentCache } from "./hooks/useContentCache";

export type PanelSystemContextValue = {
  config: PanelLayoutConfig;
  style?: React.CSSProperties;
  layers: {
    /** Raw panel definitions (no grid normalization). */
    defs: LayerDefinition[];
    /** Fast lookup map by id for consumers. */
    layerById: Map<string, LayerDefinition>;
  };
  /**
   * Get cached content for a layer. Returns the same ReactNode reference
   * for the same layer ID to prevent remounting on parent re-renders.
   */
  getCachedContent: (layerId: string) => React.ReactNode | null;
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

  // Content resolver for useContentCache
  const resolveContent = React.useCallback(
    (layerId: string): React.ReactNode | null => {
      const layer = layerById.get(layerId);
      return layer?.component ?? null;
    },
    [layerById],
  );

  // Valid IDs for cache cleanup
  const validIds = React.useMemo(() => layers.map((l) => l.id), [layers]);

  // Use shared content cache hook
  const { getCachedContent } = useContentCache({
    resolveContent,
    validIds,
  });

  const value = React.useMemo<PanelSystemContextValue>(
    () => ({
      config,
      style,
      layers: {
        defs: layers,
        layerById,
      },
      getCachedContent,
    }),
    [config, style, layers, layerById, getCachedContent],
  );

  return <PanelSystemContext.Provider value={value}>{children}</PanelSystemContext.Provider>;
};
