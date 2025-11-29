/**
 * @file Layer list rendering inside the grid layout.
 */
import * as React from "react";
import type { LayerDefinition } from "../../types";
import { useGridLayoutContext } from "../../modules/grid/GridLayoutContext";
import type { ResizeHandleConfig } from "../../modules/grid/GridLayoutContext";
import { LayerInstanceProvider } from "../../modules/grid/LayerInstanceContext";
import { PopupLayerPortal } from "../window/PopupLayerPortal";
import { FloatingWindow } from "../window/FloatingWindow";
import { GridLayerResizeHandles } from "./GridLayerResizeHandles";
import { PivotLayer } from "../pivot/PivotLayer";

type GridLayerListProps = {
  layers: LayerDefinition[];
};

/**
 * Renders layer content with optional FloatingWindow chrome.
 * Handles both chrome and non-chrome layers.
 */
const LayerContentRenderer = React.memo<{
  layer: LayerDefinition;
  onClose: () => void;
}>(({ layer, onClose }) => {
  const content = layer.pivot ? <PivotLayer pivot={layer.pivot} /> : <>{layer.component}</>;

  if (!layer.floating?.chrome) {
    return content;
  }

  return (
    <FloatingWindow id={layer.id} config={layer.floating} onClose={onClose}>
      {content}
    </FloatingWindow>
  );
});
LayerContentRenderer.displayName = "LayerContentRenderer";

/**
 * Renders resize handles if the layer is resizable.
 */
const LayerResizeHandles = React.memo<{
  layerId: string;
  isResizable: boolean;
  onPointerDown: (config: ResizeHandleConfig, event: React.PointerEvent<HTMLDivElement>) => void;
}>(({ layerId, isResizable, onPointerDown }) => {
  if (!isResizable) {
    return null;
  }
  return <GridLayerResizeHandles layerId={layerId} onPointerDown={onPointerDown} />;
});
LayerResizeHandles.displayName = "LayerResizeHandles";

/**
 * Renders a single embedded layer (non-popup).
 */
const EmbeddedLayer = React.memo<{
  layer: LayerDefinition;
  handleLayerPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}>(({ layer, handleLayerPointerDown }) => {
  const { getLayerRenderState } = useGridLayoutContext();
  const { style, isResizable, isResizing, onResizeHandlePointerDown } = getLayerRenderState(layer);

  const gridPlacementStyle = React.useMemo<React.CSSProperties>(() => {
    const placement: React.CSSProperties = {};
    if (layer.gridArea) {
      placement.gridArea = layer.gridArea;
    }
    if (layer.gridRow) {
      placement.gridRow = layer.gridRow;
    }
    if (layer.gridColumn) {
      placement.gridColumn = layer.gridColumn;
    }
    return placement;
  }, [layer.gridArea, layer.gridRow, layer.gridColumn]);

  const combinedStyle = React.useMemo<React.CSSProperties>(() => {
    // min-width/height: 0 allows grid items to shrink below content size
    // overflow: hidden prevents content from causing layout overflow
    const baseStyle: React.CSSProperties = {
      ...style,
      ...gridPlacementStyle,
      minWidth: 0,
      minHeight: 0,
      overflow: "hidden",
    };
    return isResizable ? { ...baseStyle, position: "relative" } : baseStyle;
  }, [style, gridPlacementStyle, isResizable]);

  const handleClose = React.useCallback(() => {
    layer.floating?.onClose?.();
  }, [layer.floating]);

  return (
    <div
      data-layer-id={layer.id}
      data-draggable={Boolean(layer.floating?.draggable)}
      data-resizable={isResizable}
      data-resizing={isResizing}
      style={combinedStyle}
      onPointerDown={handleLayerPointerDown}
    >
      <LayerInstanceProvider layerId={layer.id}>
        <LayerContentRenderer layer={layer} onClose={handleClose} />
      </LayerInstanceProvider>
      <LayerResizeHandles layerId={layer.id} isResizable={isResizable} onPointerDown={onResizeHandlePointerDown} />
    </div>
  );
});
EmbeddedLayer.displayName = "EmbeddedLayer";

export const GridLayerList: React.FC<GridLayerListProps> = ({ layers }) => {
  const { handleLayerPointerDown } = useGridLayoutContext();

  return (
    <>
      {layers.map((layer) => {
        const floatingMode = layer.floating?.mode ?? "embedded";
        if (layer.floating && floatingMode === "popup") {
          return <PopupLayerPortal key={layer.id} layer={layer} />;
        }
        return <EmbeddedLayer key={layer.id} layer={layer} handleLayerPointerDown={handleLayerPointerDown} />;
      })}
    </>
  );
};
