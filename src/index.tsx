/**
 * @file Main entry point for the React Panel Layout library
 */

// ============================================================================
// Core Type Definitions
// ============================================================================
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
  WindowOffset,
  WindowPosition,
  WindowSize,
  WindowBounds,
  WindowConstraints,
  PopupWindowFeatures,
  PopupWindowOptions,
  PopupWindowFactoryConfig,
  FloatingWindowMode,
  FloatingWindowConfig,
} from "./panels";

// ============================================================================
// Main Layout Component
// ============================================================================
export { GridLayout } from "./components/layout/grid/GridLayout";
export type { GridLayoutProps } from "./components/layout/grid/GridLayout";

// ============================================================================
// Drawer Components
// ============================================================================
export { Drawer } from "./components/drawer/Drawer";
export type { DrawerProps } from "./components/drawer/Drawer";
export { DrawerLayers } from "./components/drawer/DrawerLayers";
export type { DrawerLayersProps } from "./components/drawer/DrawerLayers";

// ============================================================================
// Panel Components
// ============================================================================
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

// ============================================================================
// Public Hooks
// ============================================================================
export { useLayerDragHandle } from "./components/layout/grid/useLayerDragHandle";
