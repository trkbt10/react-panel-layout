/**
 * @file Hook for managing drawer state (controlled/uncontrolled)
 *
 * Provides state management for drawer layers with support for:
 * - Controlled mode (external state via drawer.open)
 * - Uncontrolled mode (internal state via defaultOpen)
 * - State change notifications via onStateChange callback
 */
import * as React from "react";
import { useEffectEvent } from "../../hooks/useEffectEvent";
import type { LayerDefinition } from "../../panels";

/**
 * Hook to manage drawer state
 *
 * @param layers - Layer definitions with drawer configurations
 * @returns Functions to get and update drawer states
 */
export const useDrawerState = (layers: LayerDefinition[]) => {
  // Internal state for uncontrolled drawers
  // Initialized once based on defaultOpen values
  const [drawerStates, setDrawerStates] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    layers.forEach((layer) => {
      if (layer.drawer) {
        initial[layer.id] = layer.drawer.defaultOpen ?? false;
      }
    });
    return initial;
  });

  // Create stable lookup map for layers
  const layerMap = React.useMemo(() => {
    const map = new Map<string, LayerDefinition>();
    layers.forEach((layer) => {
      map.set(layer.id, layer);
    });
    return map;
  }, [layers]);

  // useEffectEvent: Stable callback that accesses latest layer configurations
  // without triggering effect re-runs when layers change
  const notifyStateChange = useEffectEvent((layerId: string, newState: boolean) => {
    const layer = layerMap.get(layerId);
    layer?.drawer?.onStateChange?.(newState);
  });

  // Get effective drawer state (controlled or uncontrolled)
  const state = React.useCallback(
    (layerId: string): boolean => {
      const layer = layerMap.get(layerId);
      if (!layer?.drawer) {
        return false;
      }
      // If drawer.open is provided, use it (controlled mode)
      if (layer.drawer.open !== undefined) {
        return layer.drawer.open;
      }
      // Otherwise use internal state (uncontrolled mode)
      return drawerStates[layerId] ?? false;
    },
    [layerMap, drawerStates],
  );

  // Open drawer
  const open = React.useCallback(
    (layerId: string) => {
      const layer = layerMap.get(layerId);
      if (!layer?.drawer) {
        return;
      }

      // For controlled drawers, just notify the parent
      if (layer.drawer.open !== undefined) {
        notifyStateChange(layerId, true);
        return;
      }

      // For uncontrolled drawers, update internal state and notify
      setDrawerStates((prev) => {
        if (prev[layerId]) {
          return prev; // Already open
        }
        notifyStateChange(layerId, true);
        return { ...prev, [layerId]: true };
      });
    },
    [layerMap, notifyStateChange],
  );

  // Close drawer (for backdrop clicks and close button)
  const close = React.useCallback(
    (layerId: string) => {
      const layer = layerMap.get(layerId);
      if (!layer?.drawer) {
        return;
      }

      // For controlled drawers, just notify the parent
      if (layer.drawer.open !== undefined) {
        notifyStateChange(layerId, false);
        return;
      }

      // For uncontrolled drawers, update internal state and notify
      setDrawerStates((prev) => {
        if (!prev[layerId]) {
          return prev; // Already closed
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
