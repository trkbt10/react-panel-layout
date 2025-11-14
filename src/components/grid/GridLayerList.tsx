/**
 * @file Layer list rendering inside the grid layout.
 */
import * as React from "react";
import type { LayerDefinition } from "../../types";
import { useGridLayoutContext } from "../../modules/grid/GridLayoutContext";
import { LayerInstanceProvider } from "../../modules/grid/LayerInstanceContext";
import { PopupLayerPortal } from "../window/PopupLayerPortal";
import { GridLayerResizeHandles } from "./GridLayerResizeHandles";
import type { ResizeHandleConfig } from "../../modules/grid/GridLayoutContext";

type GridLayerListProps = {
  layers: LayerDefinition[];
};

type ResizeHandleRenderRequest = {
  layerId: string;
  onPointerDown: (config: ResizeHandleConfig, event: React.PointerEvent<HTMLDivElement>) => void;
};

export const GridLayerList: React.FC<GridLayerListProps> = ({ layers }) => {
  const { handleLayerPointerDown, getLayerRenderState } = useGridLayoutContext();

  const renderResizeHandles = React.useCallback((requests: ResizeHandleRenderRequest[]): React.ReactNode => {
    if (requests.length === 0) {
      return null;
    }
    return requests.map((request) => (
      <GridLayerResizeHandles key={request.layerId} layerId={request.layerId} onPointerDown={request.onPointerDown} />
    ));
  }, []);

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

        const buildCombinedStyle = (): React.CSSProperties => {
          if (isResizable) {
            return { ...style, ...gridPlacementStyle, position: "relative" as const };
          }
          return { ...style, ...gridPlacementStyle };
        };
        const combinedStyle = buildCombinedStyle();

        const buildResizeHandleRequests = (): ResizeHandleRenderRequest[] => {
          if (!isResizable) {
            return [];
          }
          return [
            {
              layerId: layer.id,
              onPointerDown: onResizeHandlePointerDown,
            },
          ];
        };
        const resizeHandles = renderResizeHandles(buildResizeHandleRequests());

        return (
          <div
            key={layer.id}
            data-layer-id={layer.id}
            data-draggable={Boolean(layer.floating?.draggable)}
            data-resizable={isResizable}
            data-resizing={isResizing}
            style={combinedStyle}
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
