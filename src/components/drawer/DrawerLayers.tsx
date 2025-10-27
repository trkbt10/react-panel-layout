/**
 * @file DrawerLayers component
 *
 * Manages and renders multiple drawer layers with centralized state management.
 * Each layer can be configured with drawer behavior (placement, size, dismissible, etc.)
 * and supports both controlled and uncontrolled modes.
 */
import * as React from "react";
import type { LayerDefinition } from "../../panels";
import { Drawer } from "./Drawer";
import { useDrawerState } from "./useDrawerState";

export type DrawerLayersProps = {
  /** Layer definitions with optional drawer configuration */
  layers: LayerDefinition[];
};

/**
 * DrawerLayers component
 *
 * Renders all layers that have drawer configuration.
 * Each drawer's open/close state is managed by useDrawerState hook.
 *
 * @example
 * ```tsx
 * const layers = [
 *   {
 *     id: "sidebar",
 *     drawer: { placement: "left", size: 300 },
 *     component: <Sidebar />
 *   },
 *   {
 *     id: "menu",
 *     drawer: { placement: "right", dismissible: true },
 *     component: <Menu />
 *   }
 * ];
 *
 * <DrawerLayers layers={layers} />
 * ```
 */
export const DrawerLayers: React.FC<DrawerLayersProps> = ({ layers }) => {
  const drawer = useDrawerState(layers);

  // Filter only layers with drawer configuration
  const drawerLayers = React.useMemo(() => layers.filter((layer) => layer.drawer), [layers]);

  // Create stable close handlers for each layer
  // This prevents unnecessary re-renders of Drawer components
  const closeHandlers = React.useMemo(() => {
    const handlers = new Map<string, () => void>();
    drawerLayers.forEach((layer) => {
      handlers.set(layer.id, () => drawer.close(layer.id));
    });
    return handlers;
  }, [drawerLayers, drawer.close]);

  return (
    <>
      {drawerLayers.map((layer) => {
        if (!layer.drawer) {
          return null;
        }

        const isOpen = drawer.state(layer.id);
        const onClose = closeHandlers.get(layer.id);

        if (!onClose) {
          return null;
        }

        return (
          <Drawer
            key={layer.id}
            id={layer.id}
            config={layer.drawer}
            isOpen={isOpen}
            onClose={onClose}
            style={layer.style}
            zIndex={layer.zIndex}
            width={layer.width}
            height={layer.height}
          >
            {layer.component}
          </Drawer>
        );
      })}
    </>
  );
};
