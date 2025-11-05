/**
 * @file Top-level grid layout component that composes shared hooks and context.
 */
import * as React from "react";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import type { LayerDefinition, PanelLayoutConfig } from "../../../panels";
import { DrawerLayers } from "../../../modules/window/DrawerLayers";
import styles from "../../../modules/grid/GridLayout.module.css";
import { GridLayoutProvider } from "../../../modules/grid/GridLayoutContext";
import { GridLayers } from "../../../modules/grid/GridLayers";
import { ResizeHandleRenderer } from "../../../modules/grid/ResizeHandleRenderer";
import { useGridPlacements } from "../../../modules/grid/useGridPlacements";
import { useGridTracks } from "../../../modules/grid/useGridTracks";
import { useLayerInteractions } from "../../../modules/grid/useLayerInteractions";
import { createTrackKey } from "../../../modules/grid/trackTemplates";

export type GridLayoutProps = {
  config: PanelLayoutConfig;
  layers: LayerDefinition[];
  style?: React.CSSProperties;
};

export const GridLayout: React.FC<GridLayoutProps> = ({ config, layers, style: styleProp }) => {
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const { isIntersecting } = useIntersectionObserver(gridRef, { threshold: 0 });

  const { normalizedLayers, visibleLayers, regularLayers, layerById } = useGridPlacements(config, layers);
  const { columnHandles, rowHandles, gapSizes, gridStyle, handleResize } = useGridTracks(config, styleProp);
  const { providerValue, draggingLayerId, resizingLayerId } = useLayerInteractions({
    layers: normalizedLayers,
    layerById,
  });

  return (
    <GridLayoutProvider value={providerValue}>
      <div
        ref={gridRef}
        className={styles.gridLayout}
        style={gridStyle}
        data-dragging={draggingLayerId ? "true" : undefined}
        data-resizing={resizingLayerId ? "true" : undefined}
        data-visible={isIntersecting ? "true" : "false"}
      >
        <GridLayers layers={regularLayers} />

        {columnHandles.map(({ trackIndex, align }) => {
          return (
            <ResizeHandleRenderer
              key={`${createTrackKey("col", trackIndex)}:${align}`}
              direction="col"
              trackIndex={trackIndex}
              align={align}
              gap={gapSizes.columnGap}
              onResize={handleResize}
            />
          );
        })}

        {rowHandles.map(({ trackIndex, align }) => {
          return (
            <ResizeHandleRenderer
              key={`${createTrackKey("row", trackIndex)}:${align}`}
              direction="row"
              trackIndex={trackIndex}
              align={align}
              gap={gapSizes.rowGap}
              onResize={handleResize}
            />
          );
        })}
      </div>

      <DrawerLayers layers={visibleLayers} />
    </GridLayoutProvider>
  );
};

/* Debug note: Refactored without consulting additional files beyond new hooks and context within this directory. */
