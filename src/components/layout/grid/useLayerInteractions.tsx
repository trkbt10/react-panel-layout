/**
 * @file Drag and resize interaction management for floating grid layers.
 */
import * as React from "react";
import { useDocumentPointerEvents } from "../../../hooks/useDocumentPointerEvents";
import { useEffectEvent } from "../../../hooks/useEffectEvent";
import { useIsomorphicLayoutEffect } from "../../../hooks/useIsomorphicLayoutEffect";
import type { LayerDefinition } from "../../../panels";
import { buildLayerStyleObject } from "./layerStyles";
import styles from "./GridLayout.module.css";
import type { GridLayerHandleProps, GridLayoutContextValue } from "./GridLayoutContext";

type LayerSize = {
  width: number;
  height: number;
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

type HorizontalEdge = "left" | "right";
type VerticalEdge = "top" | "bottom";

type ResizeHandleConfig =
  | {
      key: "top-left" | "top-right" | "bottom-left" | "bottom-right";
      variant: "corner";
      horizontal: HorizontalEdge;
      vertical: VerticalEdge;
      className: keyof typeof styles;
    }
  | {
      key: "left" | "right" | "top" | "bottom";
      variant: "edge";
      horizontal?: HorizontalEdge;
      vertical?: VerticalEdge;
      className: keyof typeof styles;
    };

type ResizeState = {
  layerId: string;
  pointerId: number;
  horizontalEdge?: HorizontalEdge;
  verticalEdge?: VerticalEdge;
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

const resolveHorizontalSizeCandidate = (
  edge: HorizontalEdge | undefined,
  startSize: number,
  delta: number,
): number => {
  if (!edge) {
    return startSize;
  }
  return edge === "left" ? startSize - delta : startSize + delta;
};

const resolveVerticalSizeCandidate = (edge: VerticalEdge | undefined, startSize: number, delta: number): number => {
  if (!edge) {
    return startSize;
  }
  return edge === "top" ? startSize - delta : startSize + delta;
};

const resolveHorizontalPosition = (
  edge: HorizontalEdge | undefined,
  startPosition: number,
  delta: number,
): number => {
  if (!edge || edge === "right") {
    return startPosition;
  }
  return startPosition + delta;
};

const resolveVerticalPosition = (
  edge: VerticalEdge | undefined,
  startPosition: number,
  delta: number,
): number => {
  if (!edge || edge === "bottom") {
    return startPosition;
  }
  return startPosition + delta;
};

const findLayerElementById = (element: HTMLElement | null, layerId: string): HTMLElement | null => {
  if (!element) {
    return null;
  }
  if (element.dataset.layerId === layerId) {
    return element;
  }
  return findLayerElementById(element.parentElement, layerId);
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

  return (
    findAncestor(
      target,
      (node) => node.dataset.resizeCorner !== undefined || node.dataset.resizeEdge !== undefined,
    ) !== null
  );
};

const shouldRenderFloatingResize = (layer: LayerDefinition): boolean => {
  if (!layer.resizable) {
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

const RESIZE_HANDLE_CONFIGS: ReadonlyArray<ResizeHandleConfig> = [
  { key: "top-left", variant: "corner", horizontal: "left", vertical: "top", className: "cornerHandleTopLeft" },
  { key: "top-right", variant: "corner", horizontal: "right", vertical: "top", className: "cornerHandleTopRight" },
  { key: "bottom-left", variant: "corner", horizontal: "left", vertical: "bottom", className: "cornerHandleBottomLeft" },
  {
    key: "bottom-right",
    variant: "corner",
    horizontal: "right",
    vertical: "bottom",
    className: "cornerHandleBottomRight",
  },
  { key: "left", variant: "edge", horizontal: "left", className: "edgeHandleLeft" },
  { key: "right", variant: "edge", horizontal: "right", className: "edgeHandleRight" },
  { key: "top", variant: "edge", vertical: "top", className: "edgeHandleTop" },
  { key: "bottom", variant: "edge", vertical: "bottom", className: "edgeHandleBottom" },
];

const createResizeHandleElements = (
  layerId: string,
  onPointerDown: (
    id: string,
    config: ResizeHandleConfig,
    event: React.PointerEvent<HTMLDivElement>,
  ) => void,
): React.ReactNode[] => {
  return RESIZE_HANDLE_CONFIGS.map((config) => {
    const variantClass = config.variant === "corner" ? styles.cornerHandle : styles.edgeHandle;
    const classNames = `${styles.resizeHandle} ${variantClass} ${styles[config.className]}`;
    const datasetProps =
      config.variant === "corner" ? { "data-resize-corner": config.key } : { "data-resize-edge": config.key };
    return (
      <div
        key={config.key}
        role="presentation"
        aria-hidden="true"
        className={classNames}
        {...datasetProps}
        onPointerDown={(event) => {
          onPointerDown(layerId, config, event);
        }}
      />
    );
  });
};

const resolveResizeHandles = (
  layerId: string,
  shouldShow: boolean,
  onPointerDown: (
    id: string,
    config: ResizeHandleConfig,
    event: React.PointerEvent<HTMLDivElement>,
  ) => void,
): React.ReactNode => {
  if (!shouldShow) {
    return null;
  }
  return createResizeHandleElements(layerId, onPointerDown);
};

const computeResizableLayerSizes = (
  layers: LayerDefinition[],
  previousSizes: Record<string, LayerSize>,
  activeResizeLayerId: string | null,
): { sizes: Record<string, LayerSize>; changed: boolean } => {
  const nextSizes = layers
    .filter(shouldRenderFloatingResize)
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

type UseLayerInteractionsArgs = {
  layers: LayerDefinition[];
  layerById: Map<string, LayerDefinition>;
};

export const useLayerInteractions = ({
  layers,
  layerById,
}: UseLayerInteractionsArgs): {
  providerValue: GridLayoutContextValue;
  draggingLayerId: string | null;
  resizingLayerId: string | null;
} => {
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
      const { sizes, changed } = computeResizableLayerSizes(layers, previousSizes, resizingLayerId);
      return changed ? sizes : previousSizes;
    });
  }, [layers, resizingLayerId]);

  const beginLayerDrag = React.useCallback(
    (layerId: string, layer: LayerDefinition, captureElement: HTMLElement, event: React.PointerEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (captureElement.setPointerCapture) {
        try {
          captureElement.setPointerCapture(event.pointerId);
        } catch {
          // Ignore failures; pointer capture is not mandatory.
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
        target: captureElement,
      };
    },
    [layerPositions],
  );

  const handleLayerPointerDown = React.useCallback(
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

      beginLayerDrag(layerId, layer, event.currentTarget, event);
    },
    [beginLayerDrag, layerById],
  );

  const handleDragHandlePointerDown = React.useCallback(
    (layerId: string, event: React.PointerEvent<HTMLElement>) => {
      const layer = layerById.get(layerId);
      if (!layer?.draggable) {
        return;
      }

      if (!isFloatingLayer(layer)) {
        return;
      }

      if (isInteractiveElement(event.target)) {
        return;
      }

      if (isResizeControl(event.target)) {
        return;
      }

      const layerElement = findLayerElementById(event.currentTarget as HTMLElement, layerId);
      if (!layerElement) {
        return;
      }

      beginLayerDrag(layerId, layer, layerElement, event);
    },
    [beginLayerDrag, layerById],
  );

  const handleResizePointerDown = React.useCallback(
    (layerId: string, config: ResizeHandleConfig, event: React.PointerEvent<HTMLDivElement>) => {
      const layer = layerById.get(layerId);
      if (!layer || !shouldRenderFloatingResize(layer)) {
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
        horizontalEdge: config.horizontal,
        verticalEdge: config.vertical,
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

      const widthCandidate = resolveHorizontalSizeCandidate(resizeStart.horizontalEdge, resizeStart.startWidth, deltaX);
      const heightCandidate = resolveVerticalSizeCandidate(resizeStart.verticalEdge, resizeStart.startHeight, deltaY);

      const nextWidth = clampDimension(widthCandidate, resizeStart.minWidth, resizeStart.maxWidth);
      const nextHeight = clampDimension(heightCandidate, resizeStart.minHeight, resizeStart.maxHeight);

      const widthDelta = resizeStart.startWidth - nextWidth;
      const heightDelta = resizeStart.startHeight - nextHeight;

      const nextPositionX = resolveHorizontalPosition(
        resizeStart.horizontalEdge,
        resizeStart.startPosition.x,
        widthDelta,
      );
      const nextPositionY = resolveVerticalPosition(resizeStart.verticalEdge, resizeStart.startPosition.y, heightDelta);

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
    [layerById, layerPositions, layerSizes, notifyPositionChange, notifySizeChange],
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
      const fallbackSize = shouldRenderFloatingResize(layer) ? getLayerSizeFromDefinition(layer) : null;
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
    [draggingLayerId, layerPositions, layerSizes, resizingLayerId],
  );

  const getResizeHandleState = React.useCallback(
    (layer: LayerDefinition): { handles: React.ReactNode; isResizable: boolean } => {
      const canRenderCornerResize = shouldRenderFloatingResize(layer);
      if (!canRenderCornerResize) {
        return { handles: null, isResizable: false };
      }

      const storedLayerSize = layerSizes[layer.id];
      const fallbackLayerSize = getLayerSizeFromDefinition(layer);
      const sizeForHandle = storedLayerSize ?? fallbackLayerSize;
      const showResizeHandles = sizeForHandle !== null;
      const handles = resolveResizeHandles(layer.id, showResizeHandles, handleResizePointerDown);

      return {
        handles,
        isResizable: showResizeHandles,
      };
    },
    [handleResizePointerDown, layerSizes],
  );

  const getLayerRenderState = React.useCallback(
    (layer: LayerDefinition) => {
      const { handles, isResizable } = getResizeHandleState(layer);
      const style = buildDraggableLayerStyle(layer);
      const isResizing = resizingLayerId === layer.id;

      return {
        style,
        isResizable,
        isResizing,
        resizeHandles: handles,
      };
    },
    [buildDraggableLayerStyle, getResizeHandleState, resizingLayerId],
  );

  const getLayerHandleProps = React.useCallback(
    (layerId: string): GridLayerHandleProps => {
      return {
        "data-drag-handle": "true",
        onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
          handleDragHandlePointerDown(layerId, event);
        },
      };
    },
    [handleDragHandlePointerDown],
  );

  const providerValue = React.useMemo<GridLayoutContextValue>(
    () => ({
      handleLayerPointerDown,
      getLayerRenderState,
      getLayerHandleProps,
    }),
    [getLayerHandleProps, getLayerRenderState, handleLayerPointerDown],
  );

  return {
    providerValue,
    draggingLayerId,
    resizingLayerId,
  };
};

/* Debug note: Reviewed GridLayout.module.css and LayerInstanceContext to keep drag handle integration consistent. */
