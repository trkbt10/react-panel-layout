/**
 * @file Context provider for grid layer rendering helpers.
 */
import * as React from "react";
import type { LayerDefinition } from "../../../panels";

export type GridLayerHandleProps = React.HTMLAttributes<HTMLElement> & {
  "data-drag-handle": "true";
};

export type GridLayerRenderState = {
  style: React.CSSProperties;
  isResizable: boolean;
  isResizing: boolean;
  resizeHandles: React.ReactNode;
};

export type GridLayoutContextValue = {
  handleLayerPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getLayerRenderState: (layer: LayerDefinition) => GridLayerRenderState;
  getLayerHandleProps: (layerId: string) => GridLayerHandleProps;
};

const GridLayoutContext = React.createContext<GridLayoutContextValue | null>(null);

export const GridLayoutProvider: React.FC<
  React.PropsWithChildren<{ value: GridLayoutContextValue }>
> = ({ value, children }) => {
  return <GridLayoutContext.Provider value={value}>{children}</GridLayoutContext.Provider>;
};

export const useGridLayoutContext = (): GridLayoutContextValue => {
  const context = React.useContext(GridLayoutContext);
  if (!context) {
    throw new Error("useGridLayoutContext must be used within a GridLayoutProvider.");
  }
  return context;
};
