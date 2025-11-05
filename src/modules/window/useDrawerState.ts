/**
 * @file Hook for managing drawer state (controlled/uncontrolled)
 */
import * as React from "react";
import { useEffectEvent } from "../../hooks/useEffectEvent";
import type { LayerDefinition } from "../../panels";

export const useDrawerState = (layers: LayerDefinition[]) => {
  const [drawerStates, setDrawerStates] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    layers.forEach((layer) => {
      if (layer.drawer) {
        initial[layer.id] = layer.drawer.defaultOpen ?? false;
      }
    });
    return initial;
  });

  const layerMap = React.useMemo(() => {
    const map = new Map<string, LayerDefinition>();
    layers.forEach((layer) => {
      map.set(layer.id, layer);
    });
    return map;
  }, [layers]);

  const notifyStateChange = useEffectEvent((layerId: string, newState: boolean) => {
    const layer = layerMap.get(layerId);
    layer?.drawer?.onStateChange?.(newState);
  });

  const state = React.useCallback(
    (layerId: string): boolean => {
      const layer = layerMap.get(layerId);
      if (!layer?.drawer) {
        return false;
      }
      if (layer.drawer.open !== undefined) {
        return layer.drawer.open;
      }
      return drawerStates[layerId] ?? false;
    },
    [layerMap, drawerStates],
  );

  const open = React.useCallback(
    (layerId: string) => {
      const layer = layerMap.get(layerId);
      if (!layer?.drawer) {
        return;
      }
      if (layer.drawer.open !== undefined) {
        notifyStateChange(layerId, true);
        return;
      }
      setDrawerStates((prev) => {
        if (prev[layerId]) {
          return prev;
        }
        notifyStateChange(layerId, true);
        return { ...prev, [layerId]: true };
      });
    },
    [layerMap, notifyStateChange],
  );

  const close = React.useCallback(
    (layerId: string) => {
      const layer = layerMap.get(layerId);
      if (!layer?.drawer) {
        return;
      }
      if (layer.drawer.open !== undefined) {
        notifyStateChange(layerId, false);
        return;
      }
      setDrawerStates((prev) => {
        if (!prev[layerId]) {
          return prev;
        }
        notifyStateChange(layerId, false);
        return { ...prev, [layerId]: false };
      });
    },
    [layerMap, notifyStateChange],
  );

  return {
    state,
    open,
    close,
  };
};

