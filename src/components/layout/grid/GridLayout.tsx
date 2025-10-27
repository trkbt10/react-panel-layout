/**
 * @file Grid layout component
 */
import * as React from "react";
import { DrawerLayers } from "../../drawer/DrawerLayers";
import styles from "./GridLayout.module.css";
import { ResizeHandleRenderer } from "./ResizeHandleRenderer";
import { buildLayerStyleObject } from "./layerStyles";
import {
  buildTrackTemplateString,
  createTrackKey,
  extractInitialTrackSizes,
  getResizableTrackInfo,
  type TrackDirection,
} from "./trackTemplates";
import { createTrackSizeUpdater } from "./resizeUtils";
import type { LayerDefinition, PanelLayoutConfig } from "../../../panels";
import { useEffectEvent } from "../../../hooks/useEffectEvent";
import { useDocumentPointerEvents } from "../../../hooks/useDocumentPointerEvents";
import { useIsomorphicLayoutEffect } from "../../../hooks/useIsomorphicLayoutEffect";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";

export type GridLayoutProps = {
  /** Grid layout configuration */
  config: PanelLayoutConfig;
  /** Layer definitions */
  layers: LayerDefinition[];
  /** Additional style */
  style?: React.CSSProperties;
};

type DragState = {
  x: number;
  y: number;
  initialX: number;
  initialY: number;
  layerId: string;
  pointerId: number;
  target: HTMLElement;
};

const getGapStyle = (gap?: string): React.CSSProperties => {
  return gap !== undefined ? { gap } : {};
};

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

const normalizeLayerForGrid = (layer: LayerDefinition, placements: Map<string, GridPlacement>): LayerDefinition => {
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

const resolveCurrentTrackSize = (
  trackSizes: Record<string, number>,
  track: PanelLayoutConfig["rows"][number],
  direction: TrackDirection,
  trackIndex: number,
): number => {
  const key = createTrackKey(direction, trackIndex);
  const storedSize = trackSizes[key];

  if (storedSize !== undefined) {
    return storedSize;
  }

  if (track.size.endsWith("px")) {
    return parseInt(track.size, 10);
  }

  return 300;
};

const isInteractiveElement = (target: EventTarget | null): target is HTMLElement => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName);
};

/**
 * GridLayout - Flexible grid-based layout system for node editor
 * Supports unified layer system for background, canvas, overlays, and UI elements
 */
export const GridLayout: React.FC<GridLayoutProps> = ({ config, layers, style: styleProp }) => {
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const { isIntersecting } = useIntersectionObserver(gridRef, { threshold: 0 });

  const placements = React.useMemo(() => computeGridPlacements(config.areas), [config.areas]);

  const normalizedLayers = React.useMemo(() => {
    return layers.map((layer) => normalizeLayerForGrid(layer, placements));
  }, [layers, placements]);

  const [trackSizes, setTrackSizes] = React.useState<Record<string, number>>(() => ({
    ...extractInitialTrackSizes(config.columns, "col"),
    ...extractInitialTrackSizes(config.rows, "row"),
  }));

  useIsomorphicLayoutEffect(() => {
    const nextSizes = {
      ...extractInitialTrackSizes(config.columns, "col"),
      ...extractInitialTrackSizes(config.rows, "row"),
    };

    setTrackSizes((prev) => {
      const allKeys = new Set([...Object.keys(prev), ...Object.keys(nextSizes)]);
      const hasChanges = Array.from(allKeys).some((key) => {
        return prev[key] !== nextSizes[key];
      });

      return hasChanges ? nextSizes : prev;
    });
  }, [config.columns, config.rows]);

  const areasString = React.useMemo(() => {
    return config.areas.map((row) => `"${row.join(" ")}"`).join(" ");
  }, [config.areas]);

  const gridStyle = React.useMemo((): React.CSSProperties => {
    return {
      ...config.style,
      ...styleProp,
      gridTemplateAreas: areasString,
      gridTemplateRows: buildTrackTemplateString(config.rows, trackSizes, "row"),
      gridTemplateColumns: buildTrackTemplateString(config.columns, trackSizes, "col"),
      ...getGapStyle(config.gap),
    };
  }, [config, styleProp, areasString, trackSizes]);

  const visibleLayers = React.useMemo(
    () => normalizedLayers.filter((layer) => layer.visible !== false),
    [normalizedLayers],
  );
  const regularLayers = React.useMemo(() => visibleLayers.filter((layer) => !layer.drawer), [visibleLayers]);

  const resizableColumns = React.useMemo(() => getResizableTrackInfo(config.columns), [config.columns]);
  const resizableRows = React.useMemo(() => getResizableTrackInfo(config.rows), [config.rows]);

  const columnHandleAreas = React.useMemo(() => {
    const map = new Map<number, string>();
    config.areas.forEach((row) => {
      row.forEach((area, columnIndex) => {
        if (!map.has(columnIndex) && area) {
          map.set(columnIndex, area);
        }
      });
    });
    return map;
  }, [config.areas]);

  const rowHandleAreas = React.useMemo(() => {
    return config.areas.map((row) => row[0] ?? null);
  }, [config.areas]);

  const layerById = React.useMemo(() => {
    const map = new Map<string, LayerDefinition>();
    normalizedLayers.forEach((layer) => {
      map.set(layer.id, layer);
    });
    return map;
  }, [normalizedLayers]);

  const [layerPositions, setLayerPositions] = React.useState<Record<string, { x: number; y: number }>>({});
  const [draggingLayerId, setDraggingLayerId] = React.useState<string | null>(null);
  const dragStartRef = React.useRef<DragState | null>(null);
  const notifyPositionChange = useEffectEvent((layerId: string, newPos: { x: number; y: number }) => {
    layerById.get(layerId)?.onPositionChange?.(newPos);
  });

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const layerId = event.currentTarget.dataset.layerId;
      if (!layerId) {
        return;
      }

      if (isInteractiveElement(event.target)) {
        return;
      }

      const layer = layerById.get(layerId);
      if (!layer?.draggable) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (event.currentTarget.setPointerCapture) {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Ignore failures; pointer capture isn't critical for all environments.
        }
      }

      setDraggingLayerId(layerId);
      const existingPos = layerPositions[layerId] ?? { x: 0, y: 0 };
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        initialX: existingPos.x,
        initialY: existingPos.y,
        layerId,
        pointerId: event.pointerId,
        target: event.currentTarget,
      };
    },
    [layerById, layerPositions],
  );

  const handleDragPointerMove = React.useCallback(
    (event: PointerEvent) => {
      const dragStart = dragStartRef.current;
      if (!dragStart) {
        return;
      }

      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      const newPos = {
        x: dragStart.initialX + deltaX,
        y: dragStart.initialY + deltaY,
      };

      setLayerPositions((prev) => ({ ...prev, [dragStart.layerId]: newPos }));
      notifyPositionChange(dragStart.layerId, newPos);
    },
    [notifyPositionChange],
  );

  const finishDrag = React.useCallback((event: PointerEvent) => {
    const dragStart = dragStartRef.current;
    if (dragStart) {
      if (dragStart.pointerId === event.pointerId && dragStart.target.releasePointerCapture) {
        try {
          dragStart.target.releasePointerCapture(dragStart.pointerId);
        } catch {
          // Ignore release errors (e.g., already released).
        }
      }
      dragStartRef.current = null;
    }
    setDraggingLayerId(null);
  }, []);

  useDocumentPointerEvents(draggingLayerId !== null, {
    onMove: handleDragPointerMove,
    onUp: finishDrag,
    onCancel: finishDrag,
  });

  const buildDraggableLayerStyle = React.useCallback(
    (layer: LayerDefinition): React.CSSProperties => {
      const baseStyle = buildLayerStyleObject(layer);

      if (!layer.draggable) {
        return baseStyle;
      }

      const position = layerPositions[layer.id];
      const isDragging = draggingLayerId === layer.id;
      const transformStyle = position ? { transform: `translate(${position.x}px, ${position.y}px)` } : {};
      const cursorStyle = isDragging ? "grabbing" : "grab";

      return {
        ...baseStyle,
        ...transformStyle,
        cursor: cursorStyle,
      };
    },
    [layerPositions, draggingLayerId],
  );

  const handleResize = React.useCallback(
    (direction: TrackDirection, trackIndex: number, delta: number) => {
      const tracks = direction === "row" ? config.rows : config.columns;
      const track = tracks[trackIndex];
      if (!track || !track.resizable) {
        return;
      }

      const currentSize = resolveCurrentTrackSize(trackSizes, track, direction, trackIndex);
      setTrackSizes(createTrackSizeUpdater(direction, trackIndex, currentSize, -delta, track));
    },
    [config.rows, config.columns, trackSizes],
  );

  return (
    <>
      <div
        ref={gridRef}
        className={styles.gridLayout}
        style={gridStyle}
        data-dragging={draggingLayerId ? "true" : undefined}
        data-visible={isIntersecting ? "true" : "false"}
      >
        {regularLayers.map((layer) => {
          const layerStyle = buildDraggableLayerStyle(layer);
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
              className={styles.gridLayer}
              style={{ ...layerStyle, ...gridPlacementStyle }}
              onPointerDown={handlePointerDown}
            >
              {layer.component}
            </div>
          );
        })}

        {resizableColumns.map(({ index }) => {
          const gridArea = columnHandleAreas.get(index);
          if (!gridArea) {
            return null;
          }

          return (
            <ResizeHandleRenderer
              key={createTrackKey("col", index)}
              direction="col"
              gridArea={gridArea}
              index={index}
              onResize={handleResize}
            />
          );
        })}

        {resizableRows.map(({ index }) => {
          const gridArea = rowHandleAreas[index];
          if (!gridArea) {
            return null;
          }

          return (
            <ResizeHandleRenderer
              key={createTrackKey("row", index)}
              direction="row"
              gridArea={gridArea}
              index={index}
              onResize={handleResize}
            />
          );
        })}
      </div>

      <DrawerLayers layers={visibleLayers} />
    </>
  );
};

/* Debug note: Consulted AGENTS.md React reference for Activity and useEffectEvent guidance while revising drag handlers; reviewed panels.tsx and DrawerLayers.tsx while removing layer className usage; referenced hooks in useDocumentPointerEvents.ts, useIsomorphicLayoutEffect.ts, and useIntersectionObserver.tsx to align with shared drag/visibility patterns; re-read GridLayout.module.css while implementing grid-area normalization. */
