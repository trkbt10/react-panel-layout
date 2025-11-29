/**
 * @file Hook for managing floating window state (controlled/uncontrolled)
 * Pattern based on useDrawerState.ts
 */
import * as React from "react";
import type { LayerDefinition, WindowPosition, WindowSize } from "../../types";

type FloatingState = {
  position: WindowPosition;
  size: WindowSize;
};

const DEFAULT_POSITION: WindowPosition = { left: 0, top: 0 };
const DEFAULT_SIZE: WindowSize = { width: 400, height: 300 };

export const useFloatingState = (layers: LayerDefinition[]) => {
  const [floatingStates, setFloatingStates] = React.useState<Record<string, FloatingState>>(() => {
    const initial: Record<string, FloatingState> = {};
    layers.forEach((layer) => {
      if (layer.floating) {
        const floating = layer.floating;
        initial[layer.id] = {
          position: floating.defaultPosition ?? DEFAULT_POSITION,
          size: floating.defaultSize ?? DEFAULT_SIZE,
        };
      }
    });
    return initial;
  });

  const layerMap = React.useMemo(() => {
    const map = new Map<string, LayerDefinition>();
    layers.forEach((layer) => map.set(layer.id, layer));
    return map;
  }, [layers]);

  const getPosition = React.useCallback(
    (layerId: string): WindowPosition => {
      const layer = layerMap.get(layerId);
      // Controlled mode: use position prop directly
      if (layer?.floating?.position !== undefined) {
        return layer.floating.position;
      }
      // Uncontrolled mode: use internal state
      return floatingStates[layerId]?.position ?? DEFAULT_POSITION;
    },
    [layerMap, floatingStates],
  );

  const getSize = React.useCallback(
    (layerId: string): WindowSize => {
      const layer = layerMap.get(layerId);
      // Controlled mode: use size prop directly
      if (layer?.floating?.size !== undefined) {
        return layer.floating.size;
      }
      // Uncontrolled mode: use internal state
      return floatingStates[layerId]?.size ?? DEFAULT_SIZE;
    },
    [layerMap, floatingStates],
  );

  const getZIndex = React.useCallback(
    (layerId: string): number | undefined => {
      const layer = layerMap.get(layerId);
      return layer?.floating?.zIndex;
    },
    [layerMap],
  );

  const updatePosition = React.useCallback(
    (layerId: string, position: WindowPosition) => {
      const layer = layerMap.get(layerId);
      if (!layer?.floating) {
        return;
      }

      // Update internal state only if uncontrolled
      if (layer.floating.position === undefined) {
        setFloatingStates((prev) => {
          const currentState = prev[layerId];
          if (!currentState) {
            return prev;
          }
          return {
            ...prev,
            [layerId]: { ...currentState, position },
          };
        });
      }

      // Always call callback
      layer.floating.onMove?.(position);
    },
    [layerMap],
  );

  const updateSize = React.useCallback(
    (layerId: string, size: WindowSize) => {
      const layer = layerMap.get(layerId);
      if (!layer?.floating) {
        return;
      }

      // Update internal state only if uncontrolled
      if (layer.floating.size === undefined) {
        setFloatingStates((prev) => {
          const currentState = prev[layerId];
          if (!currentState) {
            return prev;
          }
          return {
            ...prev,
            [layerId]: { ...currentState, size },
          };
        });
      }

      // Always call callback
      layer.floating.onResize?.(size);
    },
    [layerMap],
  );

  const close = React.useCallback(
    (layerId: string) => {
      const layer = layerMap.get(layerId);
      layer?.floating?.onClose?.();
    },
    [layerMap],
  );

  return {
    getPosition,
    getSize,
    getZIndex,
    updatePosition,
    updateSize,
    close,
  };
};
