/**
 * @file DrawerLayers component
 */
import * as React from "react";
import type { LayerDefinition } from "../../types";
import { Drawer } from "./Drawer";
import { useDrawerState } from "../../modules/window/useDrawerState";

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
            position={layer.position}
            backdropStyle={layer.backdropStyle}
          >
            {layer.component}
          </Drawer>
        );
      })}
    </>
  );
};
