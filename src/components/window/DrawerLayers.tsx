/**
 * @file DrawerLayers component
 */
import * as React from "react";
import type { LayerDefinition } from "../../types.js";
import { Drawer } from "./Drawer.js";
import { useDrawerState } from "../../modules/window/useDrawerState.js";

export type DrawerLayersProps = {
  layers: LayerDefinition[];
};

export const DrawerLayers: React.FC<DrawerLayersProps> = ({ layers }) => {
  const drawer = useDrawerState(layers);

  const drawerLayers = React.useMemo(() => layers.filter((layer) => layer.drawer), [layers]);

  const closeHandlers = React.useMemo(() => {
    const handlers = new Map<string, () => void>();
    drawerLayers.forEach((layer) => {
      handlers.set(layer.id, () => drawer.close(layer.id));
    });
    return handlers;
  }, [drawerLayers, drawer.close]);

  const openHandlers = React.useMemo(() => {
    const handlers = new Map<string, () => void>();
    drawerLayers.forEach((layer) => {
      handlers.set(layer.id, () => drawer.open(layer.id));
    });
    return handlers;
  }, [drawerLayers, drawer.open]);

  return (
    <>
      {drawerLayers.map((layer) => {
        if (!layer.drawer) {
          return null;
        }

        const isOpen = drawer.state(layer.id);
        const onClose = closeHandlers.get(layer.id);
        const onOpen = openHandlers.get(layer.id);

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
            onOpen={onOpen}
            zIndex={layer.zIndex}
            width={layer.width}
            height={layer.height}
            position={layer.position}
          >
            {layer.component}
          </Drawer>
        );
      })}
    </>
  );
};
