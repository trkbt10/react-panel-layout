/**
 * @file Layer list rendering inside the grid layout.
 */
import * as React from "react";
import type { LayerDefinition } from "../../../panels";
import styles from "./GridLayout.module.css";
import { useGridLayoutContext } from "./GridLayoutContext";
import { LayerInstanceProvider } from "./LayerInstanceContext";

type GridLayersProps = {
  layers: LayerDefinition[];
};

export const GridLayers: React.FC<GridLayersProps> = ({ layers }) => {
  const { handleLayerPointerDown, getLayerRenderState } = useGridLayoutContext();

  return (
    <>
      {layers.map((layer) => {
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
            data-draggable={layer.draggable}
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
