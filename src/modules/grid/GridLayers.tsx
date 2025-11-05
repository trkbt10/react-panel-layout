/**
 * @file Layer list rendering inside the grid layout.
 */
import * as React from "react";
import type { LayerDefinition } from "./types";
import { useGridLayoutContext } from "./GridLayoutContext";
import { LayerInstanceProvider } from "./LayerInstanceContext";
import { PopupLayerPortal } from "./PopupLayerPortal";
import styles from "../../components/layout/grid/GridLayout.module.css";

type GridLayersProps = {
  layers: LayerDefinition[];
};

export const GridLayers: React.FC<GridLayersProps> = ({ layers }) => {
  const { handleLayerPointerDown, getLayerRenderState } = useGridLayoutContext();

  return (
    <>
      {layers.map((layer) => {
        const floatingMode = layer.floating?.mode ?? "embedded";
        if (layer.floating && floatingMode === "popup") {
          return <PopupLayerPortal key={layer.id} layer={layer} />;
        }

        const { style, isResizable, isResizing, resizeHandles } = getLayerRenderState(layer);
        const gridPlacementStyle: React.CSSProperties = {};
        if (layer.gridArea) {
          gridPlacementStyle.gridArea = layer.gridArea;
        }
        if (layer.gridRow) {
          gridPlacementStyle.gridRow = layer.gridRow;
        }
        if (layer.gridColumn) {
          gridPlacementStyle.gridColumn = layer.gridColumn;
        }

        return (
          <div
            key={layer.id}
            data-layer-id={layer.id}
            data-draggable={layer.floating?.draggable ? "true" : undefined}
            data-resizable={isResizable ? "true" : undefined}
            data-resizing={isResizing ? "true" : undefined}
            className={styles.gridLayer}
            style={{ ...style, ...gridPlacementStyle }}
            onPointerDown={handleLayerPointerDown}
          >
            <LayerInstanceProvider layerId={layer.id}>{layer.component}</LayerInstanceProvider>
            {resizeHandles}
          </div>
        );
      })}
    </>
  );
};
