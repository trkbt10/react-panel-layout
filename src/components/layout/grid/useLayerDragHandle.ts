/**
 * @file Hook for retrieving draggable handle props for the current layer.
 */
import * as React from "react";
import { useGridLayoutContext, type GridLayerHandleProps } from "./GridLayoutContext";
import { useLayerInstance } from "./LayerInstanceContext";

export const useLayerDragHandle = (): GridLayerHandleProps => {
  const { layerId } = useLayerInstance();
  const { getLayerHandleProps } = useGridLayoutContext();

  return React.useMemo(() => {
    return getLayerHandleProps(layerId);
  }, [getLayerHandleProps, layerId]);
};
