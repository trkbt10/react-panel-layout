/**
 * @file PivotLayer component for rendering pivot behavior within GridLayout.
 * This component bridges the usePivot hook with the GridLayout layer system.
 */
import * as React from "react";
import type { PivotBehavior } from "../../types";
import { usePivot } from "../../modules/pivot";

export type PivotLayerProps = {
  pivot: PivotBehavior;
};

/**
 * Internal component that renders pivot content using React.Activity.
 * Used by GridLayerList when a layer has pivot behavior.
 */
export const PivotLayer: React.FC<PivotLayerProps> = ({ pivot }) => {
  const { Outlet } = usePivot({
    items: pivot.items,
    activeId: pivot.activeId,
    defaultActiveId: pivot.defaultActiveId,
    onActiveChange: pivot.onActiveChange,
    transitionMode: pivot.transitionMode,
  });

  return <Outlet />;
};
