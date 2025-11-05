/**
 * @file Top-level grid layout component that consumes PanelSystemContext core.
 */
import * as React from "react";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import type { LayerDefinition, PanelLayoutConfig } from "../../../panel-system/types";
import { DrawerLayers } from "../../../components/window/DrawerLayers";
import styles from "./GridLayout.module.css";
import { GridLayerList } from "./GridLayerList";
import { ResizeHandleRenderer } from "./ResizeHandleRenderer";
import { createTrackKey } from "../../../modules/grid/trackTemplates";
import { PanelSystemProvider, usePanelSystem } from "../../../PanelSystemContext";
import { useGridPlacements } from "../../../modules/grid/useGridPlacements";
import { useGridTracks } from "../../../modules/grid/useGridTracks";
import { useLayerInteractions } from "../../../modules/grid/useLayerInteractions";
import { GridLayoutProvider } from "../../../modules/grid/GridLayoutContext";

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

  return (
    <>
      <div
        ref={gridRef}
        className={styles.gridLayout}
        style={gridStyle}
        data-dragging={Boolean(draggingLayerId)}
        data-resizing={Boolean(resizingLayerId)}
        data-visible={isIntersecting}
      >
        <GridLayoutProvider value={providerValue}>
          <GridLayerList layers={regularLayers} />
        </GridLayoutProvider>

        {columnHandles.map(({ trackIndex, align }) => (
          <ResizeHandleRenderer
            key={`${createTrackKey("col", trackIndex)}:${align}`}
            direction="col"
            trackIndex={trackIndex}
            align={align}
            gap={gapSizes.columnGap}
            onResize={handleResize}
          />
        ))}

        {rowHandles.map(({ trackIndex, align }) => (
          <ResizeHandleRenderer
            key={`${createTrackKey("row", trackIndex)}:${align}`}
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
