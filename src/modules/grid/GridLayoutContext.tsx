/**
 * @file Context provider for grid layer rendering helpers.
 */
import * as React from "react";
import type { LayerDefinition } from "../../types";

export type GridLayerHandleProps = React.HTMLAttributes<HTMLElement> & {
  "data-drag-handle": "true";
};

export type ResizeHandleConfig =
  | {
      key: "top-left" | "top-right" | "bottom-left" | "bottom-right";
      variant: "corner";
      horizontal: "left" | "right";
      vertical: "top" | "bottom";
    }
  | {
      key: "left" | "right" | "top" | "bottom";
      variant: "edge";
      horizontal?: "left" | "right";
      vertical?: "top" | "bottom";
    };

export type GridLayerRenderState = {
  style: React.CSSProperties;
  isResizable: boolean;
  isResizing: boolean;
  onResizeHandlePointerDown: (config: ResizeHandleConfig, event: React.PointerEvent<HTMLDivElement>) => void;
};

export type GridLayoutContextValue = {
  handleLayerPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getLayerRenderState: (layer: LayerDefinition) => GridLayerRenderState;
  getLayerHandleProps: (layerId: string) => GridLayerHandleProps;
  /**
   * Whether the GridLayout is mounted at root level.
   * When true, scrollable layers should delegate to browser's native scroll.
   */
  isRootLevel: boolean;
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
