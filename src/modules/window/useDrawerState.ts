/**
 * @file Hook for managing drawer state (controlled/uncontrolled)
 */
import * as React from "react";
import {
  type TransitionMode,
  type TransitionOptions,
  runTransition,
} from "../../hooks/useTransitionState";
import type { LayerDefinition } from "../../types";

const parseDuration = (value: string | undefined): number => {
  if (!value) {return 300;}
  const match = value.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 300;
};

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
    layers.forEach((layer) => map.set(layer.id, layer));
    return map;
  }, [layers]);

  const updateState = React.useCallback(
    async (layerId: string, isOpen: boolean, options?: TransitionOptions) => {
      const layer = layerMap.get(layerId);
      if (!layer?.drawer) {return;}

      const mode: TransitionMode = options?.mode ?? layer.drawer.transitionMode ?? "css";
      const duration = options?.duration ?? parseDuration(layer.drawer.transitionDuration);
      const element = options?.element?.current;

      const applyState = () => {
        if (layer.drawer?.open === undefined) {
          setDrawerStates((prev) => {
            if (prev[layerId] === isOpen) {return prev;}
            return { ...prev, [layerId]: isOpen };
          });
        }
        layer.drawer?.onStateChange?.(isOpen);
      };

      await runTransition(applyState, mode, element, duration);
    },
    [layerMap],
  );

  const state = React.useCallback(
    (layerId: string): boolean => {
      const layer = layerMap.get(layerId);
      if (layer?.drawer?.open !== undefined) {
        return layer.drawer.open;
      }
      return drawerStates[layerId] ?? false;
    },
    [layerMap, drawerStates],
  );

  const open = React.useCallback(
    (id: string, options?: TransitionOptions) => updateState(id, true, options),
    [updateState],
  );

  const close = React.useCallback(
    (id: string, options?: TransitionOptions) => updateState(id, false, options),
    [updateState],
  );

  return { state, open, close };
};
