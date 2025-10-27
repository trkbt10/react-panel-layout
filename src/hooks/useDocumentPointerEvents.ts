/**
 * @file Hooks for managing document-level pointer events with proper cleanup
 */
import * as React from "react";
import { useEffectEvent } from "./useEffectEvent";

export type UseDocumentPointerEventsOptions = {
  onMove?: (e: PointerEvent) => void;
  onUp?: (e: PointerEvent) => void;
  onCancel?: (e: PointerEvent) => void;
};

/**
 * Custom hook for managing document-level pointer events with proper cleanup
 * This pattern is commonly used for drag operations that need to continue
 * even when the pointer moves outside the original element
 */
export function useDocumentPointerEvents(enabled: boolean, handlers: UseDocumentPointerEventsOptions) {
  const handleMoveEvent = useEffectEvent(handlers.onMove);
  const handleUpEvent = useEffectEvent(handlers.onUp);
  const handleCancelEvent = useEffectEvent(handlers.onCancel);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    if (handlers.onMove) {
      document.addEventListener("pointermove", handleMoveEvent, { passive: false });
    }
    if (handlers.onUp) {
      document.addEventListener("pointerup", handleUpEvent);
    }
    if (handlers.onCancel) {
      document.addEventListener("pointercancel", handleCancelEvent);
    }

    // Cleanup function
    return () => {
      if (handlers.onMove) {
        document.removeEventListener("pointermove", handleMoveEvent);
      }
      if (handlers.onUp) {
        document.removeEventListener("pointerup", handleUpEvent);
      }
      if (handlers.onCancel) {
        document.removeEventListener("pointercancel", handleCancelEvent);
      }
    };
  }, [enabled, handlers.onMove, handlers.onUp, handlers.onCancel, handleMoveEvent, handleUpEvent, handleCancelEvent]);
}

/**
 * Hook for capturing pointer during drag operations
 * This ensures that pointer events are delivered to the capturing element
 * even when the pointer moves outside its boundaries
 */
export function usePointerCapture(elementRef: React.RefObject<HTMLElement | null>, enabled: boolean, pointerId?: number) {
  React.useEffect(() => {
    const element = elementRef.current;
    if (!enabled || !element || pointerId === undefined) {
      return;
    }

    // Capture pointer
    element.setPointerCapture(pointerId);

    // Release capture on cleanup
    return () => {
      if (element.hasPointerCapture && element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }
    };
  }, [elementRef, enabled, pointerId]);
}

/**
 * Hook for preventing default pointer events during operations
 * Useful for preventing text selection, context menus, etc. during drag operations
 */
export function usePreventPointerDefaults(
  elementRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  events: string[] = ["pointerdown", "pointermove", "pointerup"],
) {
  React.useEffect(() => {
    const element = elementRef.current;
    if (!enabled || !element) {
      return;
    }

    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    // Add listeners
    events.forEach((eventType) => {
      element.addEventListener(eventType, preventDefault, { passive: false });
    });

    // Cleanup
    return () => {
      events.forEach((eventType) => {
        element.removeEventListener(eventType, preventDefault);
      });
    };
  }, [elementRef, enabled, events]);
}

/**
 * Hook that combines multiple pointer event patterns for drag operations
 */
export function useDragPointerEvents(
  elementRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  options: {
    onMove?: (e: PointerEvent) => void;
    onUp?: (e: PointerEvent) => void;
    onCancel?: (e: PointerEvent) => void;
    pointerId?: number;
    capturePointer?: boolean;
    preventDefaults?: boolean;
  },
) {
  const { onMove, onUp, onCancel, pointerId, capturePointer = true, preventDefaults = true } = options;

  // Document-level event handlers
  useDocumentPointerEvents(enabled, { onMove, onUp, onCancel });

  // Pointer capture
  const shouldCapturePointer = enabled ? capturePointer : false;
  usePointerCapture(elementRef, shouldCapturePointer, pointerId);

  // Prevent defaults
  const shouldPreventDefaults = enabled ? preventDefaults : false;
  usePreventPointerDefaults(elementRef, shouldPreventDefaults);
}
