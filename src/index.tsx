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
export { Drawer } from "./modules/window/Drawer";
export type { DrawerProps } from "./modules/window/Drawer";
export { DrawerLayers } from "./modules/window/DrawerLayers";
export type { DrawerLayersProps } from "./modules/window/DrawerLayers";

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
} from "./modules/paneling/FloatingPanelFrame";
export type {
  FloatingPanelFrameProps,
  FloatingPanelHeaderProps,
  FloatingPanelTitleProps,
  FloatingPanelMetaProps,
  FloatingPanelControlsProps,
  FloatingPanelContentProps,
} from "./modules/paneling/FloatingPanelFrame";

export { HorizontalDivider } from "./modules/resizer/HorizontalDivider";
export type { HorizontalDividerProps } from "./modules/resizer/HorizontalDivider";

export { ResizeHandle } from "./modules/resizer/ResizeHandle";
export type { ResizeHandleProps } from "./modules/resizer/ResizeHandle";

// ============================================================================
// Public Hooks
// ============================================================================
export { useLayerDragHandle } from "./modules/grid/useLayerDragHandle";
