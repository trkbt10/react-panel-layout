/**
 * @file Drag and resize interaction management for floating grid layers.
 */
import * as React from "react";
import { useDocumentPointerEvents } from "../../hooks/useDocumentPointerEvents";
import { useEffectEvent } from "../../hooks/useEffectEvent";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import type { LayerDefinition, WindowPosition, WindowSize } from "../../types";
import { clampNumber } from "../../utils/math";
// Inline style computation previously in layerStyles to keep hook-local logic
import type { CSSProperties } from "react";
import type { GridLayerHandleProps, GridLayoutContextValue, ResizeHandleConfig } from "./GridLayoutContext";
// UI components should not be imported here; expose pointer handlers instead.

type LayerSize = {
  width: number;
  height: number;
};

type DragState = {
  pointerStartX: number;
  pointerStartY: number;
  initialTranslationX: number;
  initialTranslationY: number;
  baseLeft: number;
  baseTop: number;
  layerId: string;
  pointerId: number;
  target: HTMLElement;
};

type HorizontalEdge = "left" | "right";
type VerticalEdge = "top" | "bottom";

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
  baseLeft: number;
  baseTop: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  target: HTMLElement;
};

// ------------------------------------------------------------------------------------------
// Inline layer style computation (was layerStyles.ts)
// ------------------------------------------------------------------------------------------
const resolvePositionMode = (layer: LayerDefinition): LayerDefinition["positionMode"] => {
  if (layer.positionMode) {
    return layer.positionMode;
  }
  if (layer.floating) {
    const floatingMode = layer.floating.mode ?? "embedded";
    return floatingMode === "embedded" ? "absolute" : "relative";
  }
  return "grid";
};

const getPositionModeStyle = (mode: LayerDefinition["positionMode"]): CSSProperties => {
  return { position: mode === "grid" ? "relative" : mode };
};

const getGridAreaStyle = (layer: LayerDefinition, mode: LayerDefinition["positionMode"]): CSSProperties => {
  if (mode !== "grid") {
    return {};
  }
  return {
    gridArea: layer.gridArea,
    gridRow: layer.gridRow,
    gridColumn: layer.gridColumn,
  };
};

const getAbsolutePositionStyle = (position?: WindowPosition | LayerDefinition["position"]): CSSProperties => {
  if (!position) {
    return {};
  }

  return {
    top: position.top,
    right: position.right,
    bottom: position.bottom,
    left: position.left,
  };
};

const getZIndexStyle = (zIndex?: number): CSSProperties => {
  return zIndex !== undefined ? { zIndex } : {};
};

const getDimensionsStyle = (width?: number | string, height?: number | string): CSSProperties => {
  return {
    width,
    height,
  };
};

const getPointerEventsStyle = (layer: LayerDefinition, mode: LayerDefinition["positionMode"]): CSSProperties => {
  if (layer.pointerEvents !== undefined) {
    if (typeof layer.pointerEvents === "boolean") {
      return { pointerEvents: layer.pointerEvents ? "auto" : "none" };
    }
    return { pointerEvents: layer.pointerEvents };
  }

  if (mode === "absolute" || mode === "fixed") {
    return { pointerEvents: "auto" };
  }

  return {};
};

const resolveEffectivePosition = (
  layer: LayerDefinition,
): WindowPosition | LayerDefinition["position"] | undefined => {
  // For floating layers, prioritize floating.position/defaultPosition
  if (layer.floating) {
    return layer.floating.position ?? layer.floating.defaultPosition ?? layer.position;
  }
  return layer.position;
};

const resolveEffectiveSize = (
  layer: LayerDefinition,
): {
  width?: number | string;
  height?: number | string;
} => {
  // For floating layers, prioritize floating.size/defaultSize
  if (layer.floating) {
    const floatingSize = layer.floating.size ?? layer.floating.defaultSize;
    if (floatingSize) {
      return {
        width: floatingSize.width,
        height: floatingSize.height,
      };
    }
  }
  return {
    width: layer.width,
    height: layer.height,
  };
};

const resolveEffectiveZIndex = (layer: LayerDefinition): number | undefined => {
  // For floating layers, prioritize floating.zIndex
  if (layer.floating?.zIndex !== undefined) {
    return layer.floating.zIndex;
  }
  return layer.zIndex;
};

const buildLayerStyleObject = (layer: LayerDefinition): CSSProperties => {
  const resolvedMode = resolvePositionMode(layer);
  const effectivePosition = resolveEffectivePosition(layer);
  const effectiveSize = resolveEffectiveSize(layer);
  const effectiveZIndex = resolveEffectiveZIndex(layer);

  return {
    ...layer.style,
    ...getPositionModeStyle(resolvedMode),
    ...getGridAreaStyle(layer, resolvedMode),
    ...getAbsolutePositionStyle(effectivePosition),
    ...getZIndexStyle(effectiveZIndex),
    ...getDimensionsStyle(effectiveSize.width, effectiveSize.height),
    ...getPointerEventsStyle(layer, resolvedMode),
  };
};

const resolveFloatingMode = (layer: LayerDefinition): "embedded" | "popup" | null => {
  const floating = layer.floating;
  if (!floating) {
    return null;
  }
  const mode = floating.mode ?? "embedded";
  return mode;
};

const getEmbeddedFloatingConfig = (layer: LayerDefinition) => {
  const mode = resolveFloatingMode(layer);
  if (mode !== "embedded") {
    return null;
  }
  return layer.floating ?? null;
};

const isInteractiveElement = (target: EventTarget | null): target is HTMLElement => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName);
};


const clampDimension = (value: number, min?: number, max?: number): number => {
  const resolvedMin = min ?? Number.NEGATIVE_INFINITY;
  const resolvedMax = max ?? Number.POSITIVE_INFINITY;
  return clampNumber(value, resolvedMin, resolvedMax);
};

const ensureNumericOffset = (value: number | string | undefined, key: keyof WindowPosition, layerId: string): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  throw new Error(
    `Floating layer "${layerId}" must provide a numeric "${key}" value when draggable mode is enabled.`,
  );
};

const resolveDragAnchor = (layer: LayerDefinition): { left: number; top: number } => {
  const floating = getEmbeddedFloatingConfig(layer);
  if (!floating) {
    throw new Error(`Floating layer "${layer.id}" is missing floating configuration required for dragging.`);
  }
  // Prioritize floating.position/defaultPosition over layer.position
  const position = floating.position ?? floating.defaultPosition ?? layer.position;
  if (!position) {
    throw new Error(`Floating layer "${layer.id}" must define position with left and top values.`);
  }
  return {
    left: ensureNumericOffset(position.left, "left", layer.id),
    top: ensureNumericOffset(position.top, "top", layer.id),
  };
};

const resolveFloatingConstraints = (
  layer: LayerDefinition,
): { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number } => {
  const floating = getEmbeddedFloatingConfig(layer);
  if (!floating) {
    return {};
  }
  return floating.constraints ?? {};
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
  const floating = getEmbeddedFloatingConfig(layer);
  if (!floating) {
    return false;
  }
  return floating.resizable === true;
};

const getLayerSizeFromDefinition = (layer: LayerDefinition): LayerSize | null => {
  const floating = getEmbeddedFloatingConfig(layer);
  if (!floating) {
    return null;
  }
  const size = getNumericLayerSize(layer);
  if (!size) {
    throw new Error(`Floating layer "${layer.id}" must define width and height when resizable or draggable.`);
  }
  return {
    width: size.width,
    height: size.height,
  };
};

// No-op placeholder: rendering is handled in component layer

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
  isRootLevel: boolean;
};

export const useLayerInteractions = ({
  layers,
  layerById,
  isRootLevel,
}: UseLayerInteractionsArgs): {
  providerValue: GridLayoutContextValue;
  draggingLayerId: string | null;
  resizingLayerId: string | null;
} => {
  const [draggingLayerId, setDraggingLayerId] = React.useState<string | null>(null);
  const [resizingLayerId, setResizingLayerId] = React.useState<string | null>(null);

  const [layerPositions, setLayerPositions] = React.useState<Record<string, { x: number; y: number }>>({});
  const [layerSizes, setLayerSizes] = React.useState<Record<string, LayerSize>>({});

  const dragStartRef = React.useRef<DragState | null>(null);
  const resizeStartRef = React.useRef<ResizeState | null>(null);

  const notifyFloatingMove = useEffectEvent((layerId: string, position: WindowPosition) => {
    const layer = layerById.get(layerId);
    const floating = layer?.floating;
    floating?.onMove?.(position);
  });

  const notifyFloatingResize = useEffectEvent((layerId: string, size: WindowSize) => {
    const layer = layerById.get(layerId);
    const floating = layer?.floating;
    floating?.onResize?.(size);
  });

  useIsomorphicLayoutEffect(() => {
    const { sizes, changed } = computeResizableLayerSizes(layers, layerSizes, resizingLayerId);
    if (!changed) {
      return;
    }
    setLayerSizes(sizes);
  }, [layers, resizingLayerId]);

  const beginLayerDrag = React.useCallback(
    (layerId: string, layer: LayerDefinition, target: HTMLElement, event: React.PointerEvent) => {
      const anchor = resolveDragAnchor(layer);
      const translation = layerPositions[layerId] ?? { x: 0, y: 0 };
      const dragState: DragState = {
        pointerStartX: event.clientX,
        pointerStartY: event.clientY,
        initialTranslationX: translation.x,
        initialTranslationY: translation.y,
        baseLeft: anchor.left,
        baseTop: anchor.top,
        layerId,
        pointerId: event.pointerId,
        target: target as HTMLElement,
      };

      if (dragState.target.setPointerCapture) {
        try {
          dragState.target.setPointerCapture(dragState.pointerId);
        } catch {
          // Ignore pointer capture errors
        }
      }

      dragStartRef.current = dragState;
      setDraggingLayerId(layerId);
    },
    [layerPositions],
  );

  const handleLayerPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target;
      const dragHandle = findDragHandleElement(target);
      if (!dragHandle) {
        return;
      }

      const layerId = dragHandle.closest('[data-layer-id]')?.getAttribute("data-layer-id");
      if (!layerId) {
        return;
      }
      const layer = layerById.get(layerId);
      if (!layer) {
        return;
      }
      const floating = getEmbeddedFloatingConfig(layer);
      if (!floating || floating.draggable !== true) {
        return;
      }

      if (isInteractiveElement(event.target)) {
        return;
      }

      if (isResizeControl(event.target)) {
        return;
      }

      if (dragHandle) {
        const layerElement = findLayerElementById(dragHandle as HTMLElement, layerId);
        if (!layerElement) {
          return;
        }
        beginLayerDrag(layerId, layer, layerElement, event);
        return;
      }
    },
    [beginLayerDrag, layerById],
  );

  const handleDragHandlePointerDown = React.useCallback(
    (layerId: string, event: React.PointerEvent<HTMLElement>) => {
      const layer = layerById.get(layerId);
      const floating = layer ? getEmbeddedFloatingConfig(layer) : null;
      if (!layer || !floating || floating.draggable !== true) {
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

      const baseAnchor = resolveDragAnchor(layer);
      const constraints = resolveFloatingConstraints(layer);

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
        baseLeft: baseAnchor.left,
        baseTop: baseAnchor.top,
        minWidth: constraints.minWidth,
        maxWidth: constraints.maxWidth,
        minHeight: constraints.minHeight,
        maxHeight: constraints.maxHeight,
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

      const deltaX = event.clientX - dragStart.pointerStartX;
      const deltaY = event.clientY - dragStart.pointerStartY;
      const newPos = {
        x: dragStart.initialTranslationX + deltaX,
        y: dragStart.initialTranslationY + deltaY,
      };

      setLayerPositions((prev) => ({ ...prev, [dragStart.layerId]: newPos }));
      notifyFloatingMove(dragStart.layerId, {
        left: dragStart.baseLeft + newPos.x,
        top: dragStart.baseTop + newPos.y,
      });
    },
    [notifyFloatingMove],
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
      const nextSize: WindowSize = { width: nextWidth, height: nextHeight };
      const sizeChanged =
        !currentSize || currentSize.width !== nextWidth || currentSize.height !== nextHeight;
      if (sizeChanged) {
        setLayerSizes((prev) => ({
          ...prev,
          [resizeStart.layerId]: nextSize,
        }));
        notifyFloatingResize(resizeStart.layerId, nextSize);
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
        notifyFloatingMove(resizeStart.layerId, {
          left: resizeStart.baseLeft + nextPosition.x,
          top: resizeStart.baseTop + nextPosition.y,
        });
      }
    },
    [layerById, layerPositions, layerSizes, notifyFloatingMove, notifyFloatingResize],
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

      const floating = getEmbeddedFloatingConfig(layer);
      if (!floating || floating.draggable !== true) {
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
    (layer: LayerDefinition): { isResizable: boolean; onPointerDown?: (config: ResizeHandleConfig, event: React.PointerEvent<HTMLDivElement>) => void } => {
      const canResize = shouldRenderFloatingResize(layer);
      if (!canResize) {
        return { isResizable: false };
      }

      const storedLayerSize = layerSizes[layer.id];
      const fallbackLayerSize = getLayerSizeFromDefinition(layer);
      const sizeForHandle = storedLayerSize ?? fallbackLayerSize;
      const show = sizeForHandle !== null;
      if (!show) {
        return { isResizable: false };
      }

      const onPointerDown = (config: ResizeHandleConfig, event: React.PointerEvent<HTMLDivElement>) => {
        handleResizePointerDown(layer.id, config, event);
      };

      return { isResizable: true, onPointerDown };
    },
    [handleResizePointerDown, layerSizes],
  );

  const getLayerRenderState = React.useCallback(
    (layer: LayerDefinition) => {
      const { isResizable, onPointerDown } = getResizeHandleState(layer);
      const style = buildDraggableLayerStyle(layer);
      const isResizing = resizingLayerId === layer.id;

      return {
        style,
        isResizable,
        isResizing,
        onResizeHandlePointerDown: (config: ResizeHandleConfig, event: React.PointerEvent<HTMLDivElement>) => {
          if (onPointerDown) {
            onPointerDown(config, event);
          }
        },
      };
    },
    [buildDraggableLayerStyle, getResizeHandleState, resizingLayerId],
  );

  const getLayerHandleProps = React.useCallback(
    (layerId: string): GridLayerHandleProps => {
      return {
        "data-drag-handle": "true",
        role: "button",
        "aria-roledescription": "Drag handle",
        "aria-label": "Drag layer",
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
      isRootLevel,
    }),
    [getLayerHandleProps, getLayerRenderState, handleLayerPointerDown, isRootLevel],
  );

  return {
    providerValue,
    draggingLayerId,
    resizingLayerId,
  };
};

/* Debug note: Reviewed GridLayout.module.css and LayerInstanceContext to keep drag handle integration consistent. */
const getNumericLayerSize = (layer: LayerDefinition): LayerSize | undefined => {
  // For floating layers, prioritize floating.size/defaultSize
  if (layer.floating) {
    const floatingSize = layer.floating.size ?? layer.floating.defaultSize;
    if (floatingSize) {
      return { width: floatingSize.width, height: floatingSize.height };
    }
  }
  if (typeof layer.width === "number" && typeof layer.height === "number") {
    return { width: layer.width, height: layer.height };
  }
  return undefined;
};
