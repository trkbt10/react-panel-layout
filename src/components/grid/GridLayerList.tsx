/**
 * @file Layer list rendering inside the grid layout.
 */
import * as React from "react";
import type { LayerDefinition } from "../../types";
import { useGridLayoutContext } from "../../modules/grid/GridLayoutContext";
import { LayerInstanceProvider } from "../../modules/grid/LayerInstanceContext";
import { PopupLayerPortal } from "../window/PopupLayerPortal";
import styles from "./GridLayerList.module.css";
import { GridLayerResizeHandles } from "./GridLayerResizeHandles";
import type { ResizeHandleConfig } from "../../modules/grid/GridLayoutContext";

type GridLayerListProps = {
  layers: LayerDefinition[];
};

export const GridLayerList: React.FC<GridLayerListProps> = ({ layers }) => {
  const { handleLayerPointerDown, getLayerRenderState } = useGridLayoutContext();

  const renderResizeHandles = React.useCallback(
    (
      show: boolean,
      onPointerDown: (config: ResizeHandleConfig, event: React.PointerEvent<HTMLDivElement>) => void,
      layerId: string,
    ): React.ReactNode => {
      if (!show) {
        return null;
      }
      return <GridLayerResizeHandles layerId={layerId} onPointerDown={onPointerDown} />;
    },
    [],
  );

  return (
    <>
      {layers.map((layer) => {
        const floatingMode = layer.floating?.mode ?? "embedded";
        if (layer.floating && floatingMode === "popup") {
          return <PopupLayerPortal key={layer.id} layer={layer} />;
        }

        const { style, isResizable, isResizing, onResizeHandlePointerDown } = getLayerRenderState(layer);
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
            data-draggable={Boolean(layer.floating?.draggable)}
            data-resizable={isResizable}
            data-resizing={isResizing}
            className={styles.gridLayer}
            style={{ ...style, ...gridPlacementStyle }}
            onPointerDown={handleLayerPointerDown}
          >
            <LayerInstanceProvider layerId={layer.id}>{layer.component}</LayerInstanceProvider>
            {renderResizeHandles(isResizable, (config, event) => onResizeHandlePointerDown(config, event), layer.id)}
          </div>
        );
      })}
    </>
  );
};
