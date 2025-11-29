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

const gridLayoutRootLevelStyle: React.CSSProperties = {
  ...gridLayoutBaseStyle,
  height: "auto",
  minHeight: "100%",
};

const resolveGridBaseStyle = (isRootLevel: boolean): React.CSSProperties => {
  return isRootLevel ? gridLayoutRootLevelStyle : gridLayoutBaseStyle;
};

export type GridLayoutProps = {
  config: PanelLayoutConfig;
  layers: LayerDefinition[];
  style?: React.CSSProperties;
  /**
   * When true, enables browser-native scrolling for scrollable layers.
   * Use this when GridLayout is at the root level of the application.
   */
  root?: boolean;
};

export const GridLayout: React.FC<GridLayoutProps> = ({ config, layers, style: styleProp, root = false }) => {
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const { isIntersecting } = useIntersectionObserver(gridRef, { threshold: 0 });

  return (
    <PanelSystemProvider config={config} layers={layers} style={styleProp}>
      <GridLayoutInner gridRef={gridRef} isIntersecting={isIntersecting} isRoot={root} />
    </PanelSystemProvider>
  );
};

const GridLayoutInner: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  isIntersecting: boolean;
  isRoot: boolean;
}> = ({ gridRef, isIntersecting, isRoot }) => {
  const { config, style, layers } = usePanelSystem();
  const { normalizedLayers, visibleLayers, regularLayers, layerById } = useGridPlacements(config, layers.defs);
  const { columnHandles, rowHandles, gapSizes, gridStyle, handleResize } = useGridTracks(config, style, gridRef);
  const { providerValue, draggingLayerId, resizingLayerId } = useLayerInteractions({
    layers: normalizedLayers,
    layerById,
    isRootLevel: isRoot,
  });

  const isDraggingOrResizing = draggingLayerId ? true : Boolean(resizingLayerId);
  const combinedStyle = React.useMemo(() => {
    const baseStyle = resolveGridBaseStyle(isRoot);
    return {
      ...baseStyle,
      ...gridStyle,
      ...(isDraggingOrResizing ? gridLayoutDraggingStyle : {}),
    };
  }, [gridStyle, isDraggingOrResizing, isRoot]);

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

        {columnHandles.map(({ trackIndex, align, span }) => (
          <GridTrackResizeHandle
            key={`col-${trackIndex}:${align}`}
            direction="col"
            trackIndex={trackIndex}
            align={align}
            gap={gapSizes.columnGap}
            span={span}
            onResize={handleResize}
          />
        ))}

        {rowHandles.map(({ trackIndex, align, span }) => (
          <GridTrackResizeHandle
            key={`row-${trackIndex}:${align}`}
            direction="row"
            trackIndex={trackIndex}
            align={align}
            gap={gapSizes.rowGap}
            span={span}
            onResize={handleResize}
          />
        ))}
      </div>

      <DrawerLayers layers={visibleLayers} />
    </>
  );
};

/* Debug note: Refactored to consume PanelSystemContext core for consistent separation. */
