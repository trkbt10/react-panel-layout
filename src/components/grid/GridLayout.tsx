/**
 * @file Top-level grid layout component that consumes PanelSystemContext core.
 */
import * as React from "react";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import type { LayerDefinition, PanelLayoutConfig } from "../../types";
import { DrawerLayers } from "../window/DrawerLayers";
import { GridLayerList } from "./GridLayerList";
import { GridTrackResizeHandle } from "./GridTrackResizeHandle";
import { PanelSystemProvider, usePanelSystem } from "../../PanelSystemContext";
import { useGridPlacements } from "../../modules/grid/useGridPlacements";
import { useGridTracks } from "../../modules/grid/useGridTracks";
import { useLayerInteractions } from "../../modules/grid/useLayerInteractions";
import { GridLayoutProvider } from "../../modules/grid/GridLayoutContext";

const gridLayoutBaseStyle: React.CSSProperties = {
  display: "grid",
  width: "100%",
  height: "100%",
  overflow: "hidden",
};

const gridLayoutDraggingStyle: React.CSSProperties = {
  touchAction: "none",
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
  userSelect: "none",
};

export type GridLayoutProps = {
  config: PanelLayoutConfig;
  layers: LayerDefinition[];
  style?: React.CSSProperties;
};

export const GridLayout: React.FC<GridLayoutProps> = ({ config, layers, style: styleProp }) => {
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const { isIntersecting } = useIntersectionObserver(gridRef, { threshold: 0 });

  return (
    <PanelSystemProvider config={config} layers={layers} style={styleProp}>
      <GridLayoutInner gridRef={gridRef} isIntersecting={isIntersecting} />
    </PanelSystemProvider>
  );
};

const GridLayoutInner: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  isIntersecting: boolean;
}> = ({ gridRef, isIntersecting }) => {
  const { config, style, layers } = usePanelSystem();
  const { normalizedLayers, visibleLayers, regularLayers, layerById } = useGridPlacements(config, layers.defs);
  const { columnHandles, rowHandles, gapSizes, gridStyle, handleResize } = useGridTracks(config, style);
  const { providerValue, draggingLayerId, resizingLayerId } = useLayerInteractions({
    layers: normalizedLayers,
    layerById,
  });

  const isDraggingOrResizing = draggingLayerId ? true : Boolean(resizingLayerId);
  const combinedStyle = React.useMemo(() => {
    return {
      ...gridLayoutBaseStyle,
      ...gridStyle,
      ...(isDraggingOrResizing ? gridLayoutDraggingStyle : {}),
    };
  }, [gridStyle, isDraggingOrResizing]);

  return (
    <>
      <div
        ref={gridRef}
        style={combinedStyle}
        data-dragging={Boolean(draggingLayerId)}
        data-resizing={Boolean(resizingLayerId)}
        data-visible={isIntersecting}
      >
        <GridLayoutProvider value={providerValue}>
          <GridLayerList layers={regularLayers} />
        </GridLayoutProvider>

        {columnHandles.map(({ trackIndex, align }) => (
          <GridTrackResizeHandle
            key={`col-${trackIndex}:${align}`}
            direction="col"
            trackIndex={trackIndex}
            align={align}
            gap={gapSizes.columnGap}
            onResize={handleResize}
          />
        ))}

        {rowHandles.map(({ trackIndex, align }) => (
          <GridTrackResizeHandle
            key={`row-${trackIndex}:${align}`}
            direction="row"
            trackIndex={trackIndex}
            align={align}
            gap={gapSizes.rowGap}
            onResize={handleResize}
          />
        ))}
      </div>

      <DrawerLayers layers={visibleLayers} />
    </>
  );
};

/* Debug note: Refactored to consume PanelSystemContext core for consistent separation. */
