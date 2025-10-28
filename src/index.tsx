/**
 * @file Main entry point for the React Panel Layout library
 */

// Export type definitions
export type {
  Position,
  PanelPosition,
  PanelDefinition,
  EditorPanelsConfig,
  GridTrack,
  PanelLayoutConfig,
  LayerPositionMode,
  DrawerBehavior,
  LayerDefinition,
  PanelLayoutProps,
} from "./panels";

// Export main components
export { GridLayout } from "./components/layout/grid/GridLayout";
export type { GridLayoutProps } from "./components/layout/grid/GridLayout";
export { useLayerDragHandle } from "./components/layout/grid/useLayerDragHandle";

// Export drawer components
export { Drawer } from "./components/drawer/Drawer";
export type { DrawerProps } from "./components/drawer/Drawer";
export { DrawerLayers } from "./components/drawer/DrawerLayers";
export type { DrawerLayersProps } from "./components/drawer/DrawerLayers";
export { useDrawerState } from "./components/drawer/useDrawerState";

// Export panel components
export {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelMeta,
  FloatingPanelControls,
  FloatingPanelContent,
} from "./components/panels/FloatingPanelFrame";
export type {
  FloatingPanelFrameProps,
  FloatingPanelHeaderProps,
  FloatingPanelTitleProps,
  FloatingPanelMetaProps,
  FloatingPanelControlsProps,
  FloatingPanelContentProps,
} from "./components/panels/FloatingPanelFrame";

export { HorizontalDivider } from "./components/panels/HorizontalDivider";
export type { HorizontalDividerProps } from "./components/panels/HorizontalDivider";

export { ResizeHandle } from "./components/panels/ResizeHandle";
export type { ResizeHandleProps } from "./components/panels/ResizeHandle";

export { DialogOverlay } from "./components/overlay/DialogOverlay";
export type { DialogOverlayProps } from "./components/overlay/DialogOverlay";

// Export hooks
export {
  useDocumentPointerEvents,
  usePointerCapture,
  usePreventPointerDefaults,
  useDragPointerEvents,
} from "./hooks/useDocumentPointerEvents";
export type { UseDocumentPointerEventsOptions } from "./hooks/useDocumentPointerEvents";

export { useEffectEvent } from "./hooks/useEffectEvent";
export { useIsomorphicLayoutEffect } from "./hooks/useIsomorphicLayoutEffect";
export { useResizeDrag } from "./hooks/useResizeDrag";

// Export utilities
export { getViewportInfo, calculateContextMenuPosition } from "./utils/dialogUtils";
export type { ViewportInfo } from "./utils/dialogUtils";
