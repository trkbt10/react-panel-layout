/**
 * @file Hooks for deriving grid placements and layer collections.
 */
import * as React from "react";
import type { LayerDefinition, PanelLayoutConfig } from "../../panels";

type GridPlacement = {
  gridArea: string;
  gridRow: string;
  gridColumn: string;
};

const computeGridPlacements = (areas: PanelLayoutConfig["areas"]): Map<string, GridPlacement> => {
  type Bounds = {
    rowStart: number;
    rowEnd: number;
    colStart: number;
    colEnd: number;
  };

  const boundsByArea = new Map<string, Bounds>();

  areas.forEach((row, rowIndex) => {
    row.forEach((area, colIndex) => {
      if (!area || area === ".") {
        return;
      }

      const existing = boundsByArea.get(area);
      if (existing) {
        const nextBounds: Bounds = {
          rowStart: Math.min(existing.rowStart, rowIndex),
          rowEnd: Math.max(existing.rowEnd, rowIndex),
          colStart: Math.min(existing.colStart, colIndex),
          colEnd: Math.max(existing.colEnd, colIndex),
        };

        boundsByArea.set(area, nextBounds);
        return;
      }

      const initialBounds: Bounds = {
        rowStart: rowIndex,
        rowEnd: rowIndex,
        colStart: colIndex,
        colEnd: colIndex,
      };

      boundsByArea.set(area, initialBounds);
    });
  });

  const placements = new Map<string, GridPlacement>();
  boundsByArea.forEach((bounds, area) => {
    const rowStart = bounds.rowStart + 1;
    const rowEnd = bounds.rowEnd + 2;
    const colStart = bounds.colStart + 1;
    const colEnd = bounds.colEnd + 2;

    const placement: GridPlacement = {
      gridArea: area,
      gridRow: `${rowStart} / ${rowEnd}`,
      gridColumn: `${colStart} / ${colEnd}`,
    };

    placements.set(area, placement);
  });

  return placements;
};

const normalizeLayerForGrid = (
  layer: LayerDefinition,
  placements: Map<string, GridPlacement>,
): LayerDefinition => {
  const mode = layer.positionMode ?? "grid";
  if (mode !== "grid") {
    return layer;
  }

  const placementKey = layer.gridArea ?? layer.id;
  const placement = placements.get(placementKey);

  if (!placement) {
    return layer;
  }

  const needsGridArea = !layer.gridArea;
  const needsRow = !layer.gridRow;
  const needsColumn = !layer.gridColumn;

  if (!needsGridArea && !needsRow && !needsColumn) {
    return layer;
  }

  return {
    ...layer,
    gridArea: needsGridArea ? placement.gridArea : layer.gridArea,
    gridRow: needsRow ? placement.gridRow : layer.gridRow,
    gridColumn: needsColumn ? placement.gridColumn : layer.gridColumn,
  };
};

export const useGridPlacements = (
  config: PanelLayoutConfig,
  layers: LayerDefinition[],
): {
  normalizedLayers: LayerDefinition[];
  visibleLayers: LayerDefinition[];
  regularLayers: LayerDefinition[];
  layerById: Map<string, LayerDefinition>;
} => {
  const placements = React.useMemo(() => computeGridPlacements(config.areas), [config.areas]);

  const normalizedLayers = React.useMemo(() => {
    return layers.map((layer) => normalizeLayerForGrid(layer, placements));
  }, [layers, placements]);

  const visibleLayers = React.useMemo(
    () => normalizedLayers.filter((layer) => layer.visible !== false),
    [normalizedLayers],
  );

  const regularLayers = React.useMemo(
    () => visibleLayers.filter((layer) => !layer.drawer),
    [visibleLayers],
  );

  const layerById = React.useMemo(() => {
    const map = new Map<string, LayerDefinition>();
    normalizedLayers.forEach((layer) => {
      map.set(layer.id, layer);
    });
    return map;
  }, [normalizedLayers]);

  return {
    normalizedLayers,
    visibleLayers,
    regularLayers,
    layerById,
  };
};

