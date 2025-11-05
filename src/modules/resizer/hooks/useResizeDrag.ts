/**
 * @file Shared logic for draggable resize handles.
 */
import * as React from "react";
import { useDragPointerEvents } from "../../../hooks/useDocumentPointerEvents";
import { useEffectEvent } from "../../../hooks/useEffectEvent";

export type ResizeDragAxis = "x" | "y";

export type UseResizeDragOptions = {
  /** Axis along which the drag should compute deltas */
  axis: ResizeDragAxis;
  /** Callback invoked with the delta value when dragging */
  onResize?: (delta: number) => void;
};

export type UseResizeDragResult<TElement extends HTMLElement> = {
  /** Ref to attach to the draggable element */
  ref: React.RefObject<TElement | null>;
  /** Pointer down handler to initiate dragging */
  onPointerDown: (event: React.PointerEvent<TElement>) => void;
  /** Whether a drag interaction is currently active */
  isDragging: boolean;
};

/**
 * Provides unified pointer handling for resize-capable UI elements.
 *
 * @param options - Configuration for the drag interaction.
 * @returns Handlers and state for wiring into a draggable element.
 */
export const useResizeDrag = <TElement extends HTMLElement = HTMLElement>(
  options: UseResizeDragOptions,
): UseResizeDragResult<TElement> => {
  const elementRef = React.useRef<TElement | null>(null);
  const pointerIdRef = React.useRef<number | null>(null);
  const previousCoordinateRef = React.useRef<number>(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const emitResize = useEffectEvent((delta: number) => {
    options.onResize?.(delta);
  });

  const getCoordinate = React.useCallback(
    (event: PointerEvent | React.PointerEvent) => {
      return options.axis === "x" ? event.clientX : event.clientY;
    },
    [options.axis],
  );

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<TElement>) => {
      event.preventDefault();
      elementRef.current = event.currentTarget;
      pointerIdRef.current = event.pointerId;
      previousCoordinateRef.current = getCoordinate(event);
      setIsDragging(true);
    },
    [getCoordinate],
  );

  const handlePointerMove = React.useCallback(
    (event: PointerEvent) => {
      const coordinate = getCoordinate(event);
      const delta = coordinate - previousCoordinateRef.current;
      if (delta === 0) {
        return;
      }
      previousCoordinateRef.current = coordinate;
      emitResize(delta);
    },
    [getCoordinate, emitResize],
  );

  const handlePointerUp = React.useCallback(() => {
    setIsDragging(false);
    pointerIdRef.current = null;
  }, []);

  useDragPointerEvents(elementRef as React.RefObject<HTMLElement | null>, isDragging, {
    onMove: handlePointerMove,
    onUp: handlePointerUp,
    pointerId: pointerIdRef.current ?? undefined,
    capturePointer: true,
    preventDefaults: false,
  });

  return {
    ref: elementRef,
    onPointerDown: handlePointerDown,
    isDragging,
  };
};

