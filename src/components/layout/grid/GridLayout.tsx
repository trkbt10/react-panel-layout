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
  type TrackDirection,
} from "./trackTemplates";
import { createTrackSizeUpdater } from "./resizeUtils";
import type { GridTrack, LayerDefinition, PanelLayoutConfig } from "../../../panels";
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

type LayerSize = {
  width: number;
  height: number;
};

type CornerHandle = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type ResizeState = {
  layerId: string;
  pointerId: number;
  corner: CornerHandle;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startPosition: { x: number; y: number };
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  target: HTMLElement;
};

const FLOATING_POSITION_MODES: ReadonlyArray<LayerDefinition["positionMode"]> = ["absolute", "fixed"];

const isFloatingLayer = (layer: LayerDefinition): boolean => {
  const mode = layer.positionMode ?? "grid";
  return FLOATING_POSITION_MODES.includes(mode);
};

type TrackHandleConfig = {
  trackIndex: number;
  align: "start" | "end";
};

type ParsedGap = {
  rowGap: number;
  columnGap: number;
};

const computeTrackResizeHandles = (tracks: GridTrack[]): TrackHandleConfig[] => {
  if (tracks.length === 0) {
    return [];
  }

  if (tracks.length === 1) {
    const onlyTrack = tracks[0];
    return onlyTrack?.resizable ? [{ trackIndex: 0, align: "end" }] : [];
  }

  const handles: TrackHandleConfig[] = [];

  for (let boundaryIndex = 0; boundaryIndex < tracks.length - 1; boundaryIndex += 1) {
    const leftTrack = tracks[boundaryIndex];
    const rightTrack = tracks[boundaryIndex + 1];

    if (rightTrack?.resizable) {
      handles.push({ trackIndex: boundaryIndex + 1, align: "start" });
      continue;
    }

    if (leftTrack?.resizable) {
      handles.push({ trackIndex: boundaryIndex, align: "end" });
    }
  }

  return handles;
};

const parseGap = (gapValue?: string): ParsedGap => {
  if (!gapValue) {
    return { rowGap: 0, columnGap: 0 };
  }

  const tokens = gapValue
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const parseToken = (token: string): number => {
    const match = token.match(/^(-?\d+(?:\.\d+)?)px$/);
    if (!match) {
      return 0;
    }
    return Number.parseFloat(match[1]);
  };

  if (tokens.length === 1) {
    const parsed = parseToken(tokens[0]);
    return { rowGap: parsed, columnGap: parsed };
  }

  return {
    rowGap: parseToken(tokens[0]),
    columnGap: parseToken(tokens[1]),
  };
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

const parseDimensionValue = (value: number | string | undefined): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const match = value.match(/^(-?\d+(?:\.\d+)?)px$/);
    if (match) {
      return Number.parseFloat(match[1]);
    }
  }

  return null;
};

const clampDimension = (value: number, min?: number, max?: number): number => {
  const withMinimum = min !== undefined ? Math.max(value, min) : value;
  return max !== undefined ? Math.min(withMinimum, max) : withMinimum;
};

const findAncestor = (
  element: HTMLElement | null,
  predicate: (node: HTMLElement) => boolean,
  stopPredicate?: (node: HTMLElement) => boolean,
): HTMLElement | null => {
  if (!element) {
    return null;
  }
  if (stopPredicate?.(element)) {
    return null;
  }
  if (predicate(element)) {
    return element;
  }
  return findAncestor(element.parentElement, predicate, stopPredicate);
};

const findDragHandleElement = (target: EventTarget | null): HTMLElement | null => {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  return findAncestor(
    target,
    (node) => node.dataset.dragHandle === "true",
    (node) => node.dataset.dragIgnore === "true",
  );
};

const isResizeControl = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return findAncestor(target, (node) => node.dataset.resizeCorner !== undefined) !== null;
};

const shouldRenderCornerResize = (layer: LayerDefinition): boolean => {
  if (!layer.draggable || !layer.resizable) {
    return false;
  }
  return isFloatingLayer(layer);
};

const getLayerSizeFromDefinition = (layer: LayerDefinition): LayerSize | null => {
  const width = parseDimensionValue(layer.width);
  const height = parseDimensionValue(layer.height);
  if (width === null || height === null) {
    return null;
  }
  return { width, height };
};

const CORNER_RESIZE_HANDLES: ReadonlyArray<{ corner: CornerHandle; className: keyof typeof styles }> = [
  { corner: "top-left", className: "cornerHandleTopLeft" },
  { corner: "top-right", className: "cornerHandleTopRight" },
  { corner: "bottom-left", className: "cornerHandleBottomLeft" },
  { corner: "bottom-right", className: "cornerHandleBottomRight" },
];

const createCornerHandleElements = (
  layerId: string,
  onPointerDown: (id: string, corner: CornerHandle, event: React.PointerEvent<HTMLDivElement>) => void,
): React.ReactNode[] => {
  return CORNER_RESIZE_HANDLES.map(({ corner, className }) => {
    const classNames = `${styles.cornerHandle} ${styles[className]}`;
    return (
      <div
        key={corner}
        role="presentation"
        aria-hidden="true"
        data-resize-corner={corner}
        className={classNames}
        onPointerDown={(event) => {
          onPointerDown(layerId, corner, event);
        }}
      />
    );
  });
};

const resolveCornerHandles = (
  layerId: string,
  shouldShow: boolean,
  onPointerDown: (id: string, corner: CornerHandle, event: React.PointerEvent<HTMLDivElement>) => void,
): React.ReactNode => {
  if (!shouldShow) {
    return null;
  }
  return createCornerHandleElements(layerId, onPointerDown);
};

const computeResizableLayerSizes = (
  layers: LayerDefinition[],
  previousSizes: Record<string, LayerSize>,
  activeResizeLayerId: string | null,
): { sizes: Record<string, LayerSize>; changed: boolean } => {
  const nextSizes = layers
    .filter(shouldRenderCornerResize)
    .reduce<Record<string, LayerSize>>((accumulator, layer) => {
      if (activeResizeLayerId === layer.id) {
        const existing = previousSizes[layer.id];
        if (existing) {
          accumulator[layer.id] = existing;
          return accumulator;
        }
      }

      const parsedSize = getLayerSizeFromDefinition(layer);
      if (!parsedSize) {
        return accumulator;
      }

      accumulator[layer.id] = parsedSize;
      return accumulator;
    }, {});

  const previousKeys = Object.keys(previousSizes);
  const nextKeys = Object.keys(nextSizes);

  const keysChangedByLength = previousKeys.length !== nextKeys.length;
  const keysChangedByMissing = previousKeys.some((key) => {
    return !Object.prototype.hasOwnProperty.call(nextSizes, key);
  });
  const keysChanged = keysChangedByLength ? true : keysChangedByMissing;

  const sizeChanged = nextKeys.some((key) => {
    const previous = previousSizes[key];
    const next = nextSizes[key];
    if (!previous || !next) {
      return true;
    }
    return previous.width !== next.width || previous.height !== next.height;
  });

  const changed = keysChanged ? true : sizeChanged;

  return {
    sizes: nextSizes,
    changed,
  };
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

  const gapSizes = React.useMemo(() => parseGap(config.gap), [config.gap]);
  const columnHandles = React.useMemo(() => computeTrackResizeHandles(config.columns), [config.columns]);
  const rowHandles = React.useMemo(() => computeTrackResizeHandles(config.rows), [config.rows]);

  const layerById = React.useMemo(() => {
    const map = new Map<string, LayerDefinition>();
    normalizedLayers.forEach((layer) => {
      map.set(layer.id, layer);
    });
    return map;
  }, [normalizedLayers]);

  const [layerPositions, setLayerPositions] = React.useState<Record<string, { x: number; y: number }>>({});
  const [layerSizes, setLayerSizes] = React.useState<Record<string, LayerSize>>({});
  const [draggingLayerId, setDraggingLayerId] = React.useState<string | null>(null);
  const [resizingLayerId, setResizingLayerId] = React.useState<string | null>(null);
  const dragStartRef = React.useRef<DragState | null>(null);
  const resizeStartRef = React.useRef<ResizeState | null>(null);
  const notifyPositionChange = useEffectEvent((layerId: string, newPos: { x: number; y: number }) => {
    layerById.get(layerId)?.onPositionChange?.(newPos);
  });
  const notifySizeChange = useEffectEvent((layerId: string, newSize: LayerSize) => {
    layerById.get(layerId)?.onSizeChange?.(newSize);
  });

  useIsomorphicLayoutEffect(() => {
    setLayerSizes((previousSizes) => {
      const { sizes, changed } = computeResizableLayerSizes(normalizedLayers, previousSizes, resizingLayerId);
      return changed ? sizes : previousSizes;
    });
  }, [normalizedLayers, resizingLayerId]);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const layerId = event.currentTarget.dataset.layerId;
      if (!layerId) {
        return;
      }

      if (isInteractiveElement(event.target)) {
        return;
      }

      if (isResizeControl(event.target)) {
        return;
      }

      const layer = layerById.get(layerId);
      if (!layer?.draggable) {
        return;
      }

      if (isFloatingLayer(layer)) {
        const dragHandle = findDragHandleElement(event.target);
        if (!dragHandle) {
          const handleExists = event.currentTarget.querySelector('[data-drag-handle="true"]');
          if (handleExists) {
            return;
          }
        }
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

  const handleResizePointerDown = React.useCallback(
    (layerId: string, corner: CornerHandle, event: React.PointerEvent<HTMLDivElement>) => {
      const layer = layerById.get(layerId);
      if (!layer || !shouldRenderCornerResize(layer)) {
        return;
      }

      const sizeEntry = layerSizes[layerId] ?? getLayerSizeFromDefinition(layer);
      if (!sizeEntry) {
        return;
      }

      const initialPosition = layerPositions[layerId] ?? { x: 0, y: 0 };

      event.stopPropagation();
      event.preventDefault();

      if (event.currentTarget.setPointerCapture) {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture may be unsupported; ignore gracefully.
        }
      }

      resizeStartRef.current = {
        layerId,
        pointerId: event.pointerId,
        corner,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: sizeEntry.width,
        startHeight: sizeEntry.height,
        startPosition: initialPosition,
        minWidth: layer.minWidth,
        maxWidth: layer.maxWidth,
        minHeight: layer.minHeight,
        maxHeight: layer.maxHeight,
        target: event.currentTarget,
      };

      setResizingLayerId(layerId);
    },
    [layerById, layerPositions, layerSizes],
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

  const handleResizePointerMove = React.useCallback(
    (event: PointerEvent) => {
      const resizeStart = resizeStartRef.current;
      if (!resizeStart || resizeStart.pointerId !== event.pointerId) {
        return;
      }

      const layer = layerById.get(resizeStart.layerId);
      if (!layer) {
        return;
      }

      const deltaX = event.clientX - resizeStart.startX;
      const deltaY = event.clientY - resizeStart.startY;
      const horizontalEdge = resizeStart.corner.includes("left") ? "left" : "right";
      const verticalEdge = resizeStart.corner.includes("top") ? "top" : "bottom";

      const widthCandidate =
        horizontalEdge === "left" ? resizeStart.startWidth - deltaX : resizeStart.startWidth + deltaX;
      const heightCandidate =
        verticalEdge === "top" ? resizeStart.startHeight - deltaY : resizeStart.startHeight + deltaY;

      const nextWidth = clampDimension(widthCandidate, resizeStart.minWidth, resizeStart.maxWidth);
      const nextHeight = clampDimension(heightCandidate, resizeStart.minHeight, resizeStart.maxHeight);

      const widthDelta = resizeStart.startWidth - nextWidth;
      const heightDelta = resizeStart.startHeight - nextHeight;

      const nextPositionX =
        horizontalEdge === "left" ? resizeStart.startPosition.x + widthDelta : resizeStart.startPosition.x;
      const nextPositionY =
        verticalEdge === "top" ? resizeStart.startPosition.y + heightDelta : resizeStart.startPosition.y;

      const currentSize = layerSizes[resizeStart.layerId];
      const nextSize = { width: nextWidth, height: nextHeight };
      const sizeChanged =
        !currentSize || currentSize.width !== nextWidth || currentSize.height !== nextHeight;
      if (sizeChanged) {
        setLayerSizes((prev) => ({
          ...prev,
          [resizeStart.layerId]: nextSize,
        }));
        notifySizeChange(resizeStart.layerId, nextSize);
      }

      const currentPosition = layerPositions[resizeStart.layerId] ?? { x: 0, y: 0 };
      const nextPosition = { x: nextPositionX, y: nextPositionY };
      const positionChanged =
        currentPosition.x !== nextPosition.x || currentPosition.y !== nextPosition.y;
      if (positionChanged) {
        setLayerPositions((prev) => ({
          ...prev,
          [resizeStart.layerId]: nextPosition,
        }));
        notifyPositionChange(resizeStart.layerId, nextPosition);
      }
    },
    [layerById, layerSizes, layerPositions, notifyPositionChange, notifySizeChange],
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

  const finishResize = React.useCallback((event: PointerEvent) => {
    const resizeStart = resizeStartRef.current;
    if (resizeStart) {
      if (resizeStart.pointerId === event.pointerId && resizeStart.target.releasePointerCapture) {
        try {
          resizeStart.target.releasePointerCapture(resizeStart.pointerId);
        } catch {
          // Ignore pointer capture release errors.
        }
      }
      resizeStartRef.current = null;
    }
    setResizingLayerId(null);
  }, []);

  useDocumentPointerEvents(draggingLayerId !== null, {
    onMove: handleDragPointerMove,
    onUp: finishDrag,
    onCancel: finishDrag,
  });

  useDocumentPointerEvents(resizingLayerId !== null, {
    onMove: handleResizePointerMove,
    onUp: finishResize,
    onCancel: finishResize,
  });

  const buildDraggableLayerStyle = React.useCallback(
    (layer: LayerDefinition): React.CSSProperties => {
      const baseStyle = buildLayerStyleObject(layer);

      if (!layer.draggable) {
        return baseStyle;
      }

      const position = layerPositions[layer.id];
      const isDragging = draggingLayerId === layer.id;
      const isResizing = resizingLayerId === layer.id;
      const transformStyle = position ? { transform: `translate(${position.x}px, ${position.y}px)` } : {};
      const storedSize = layerSizes[layer.id];
      const fallbackSize = shouldRenderCornerResize(layer) ? getLayerSizeFromDefinition(layer) : null;
      const sizeRecord = storedSize ?? fallbackSize;
      const sizeStyle = sizeRecord ? { width: `${sizeRecord.width}px`, height: `${sizeRecord.height}px` } : {};
      const cursorStyle = isDragging || isResizing ? { cursor: "grabbing" } : {};

      return {
        ...baseStyle,
        ...sizeStyle,
        ...transformStyle,
        ...cursorStyle,
      };
    },
    [layerPositions, layerSizes, draggingLayerId, resizingLayerId],
  );

  const handleResize = React.useCallback(
    (direction: TrackDirection, trackIndex: number, delta: number) => {
      const tracks = direction === "row" ? config.rows : config.columns;
      const track = tracks[trackIndex];
      if (!track || !track.resizable) {
        return;
      }

      const currentSize = resolveCurrentTrackSize(trackSizes, track, direction, trackIndex);
      setTrackSizes(createTrackSizeUpdater(direction, trackIndex, currentSize, delta, track));
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
        data-resizing={resizingLayerId ? "true" : undefined}
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

          const canRenderCornerResize = shouldRenderCornerResize(layer);
          const storedLayerSize = layerSizes[layer.id];
          const fallbackLayerSize = canRenderCornerResize ? getLayerSizeFromDefinition(layer) : null;
          const sizeForHandle = storedLayerSize ?? fallbackLayerSize;
          const showResizeHandles = canRenderCornerResize ? sizeForHandle !== null : false;
          const isLayerResizing = resizingLayerId === layer.id;
          const resizeHandleElements = resolveCornerHandles(layer.id, showResizeHandles, handleResizePointerDown);

          return (
            <div
              key={layer.id}
              data-layer-id={layer.id}
              data-draggable={layer.draggable}
              data-resizable={showResizeHandles ? "true" : undefined}
              data-resizing={isLayerResizing ? "true" : undefined}
              className={styles.gridLayer}
              style={{ ...layerStyle, ...gridPlacementStyle }}
              onPointerDown={handlePointerDown}
            >
              {layer.component}
              {resizeHandleElements}
            </div>
          );
        })}

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
    </>
  );
};

/* Debug note: Consulted AGENTS.md React reference for Activity and useEffectEvent guidance while revising drag handlers; reviewed panels.tsx and DrawerLayers.tsx while removing layer className usage; referenced hooks in useDocumentPointerEvents.ts, useIsomorphicLayoutEffect.ts, and useIntersectionObserver.tsx to align with shared drag/visibility patterns; re-read GridLayout.module.css, ResizeHandleRenderer.tsx, and demo/pages/PanelLayout/IDELayout.tsx to align handle placement and boundary offsets with grid track definitions. */
