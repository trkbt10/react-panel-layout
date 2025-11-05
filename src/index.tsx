/**
 * @file Main entry point for the React Panel Layout library
 */

// ============================================================================
// Core Type Definitions
// ============================================================================
export type {
  // Grid / panel
  GridTrack,
  PanelLayoutConfig,
  LayerPositionMode,
  LayerDefinition,
  PanelLayoutProps,
  // Window / popup / drawer
  Position,
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
  DrawerBehavior,
} from "./types";

// ============================================================================
// Main Layout Component
// ============================================================================
export { GridLayout } from "./components/grid/GridLayout";
export type { GridLayoutProps } from "./components/grid/GridLayout";

// ============================================================================
// Drawer Components
// ============================================================================
export { Drawer } from "./components/window/Drawer";
export type { DrawerProps } from "./components/window/Drawer";
export { DrawerLayers } from "./components/window/DrawerLayers";
export type { DrawerLayersProps } from "./components/window/DrawerLayers";

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
} from "./components/paneling/FloatingPanelFrame";
export type {
  FloatingPanelFrameProps,
  FloatingPanelHeaderProps,
  FloatingPanelTitleProps,
  FloatingPanelMetaProps,
  FloatingPanelControlsProps,
  FloatingPanelContentProps,
} from "./components/paneling/FloatingPanelFrame";

export { HorizontalDivider } from "./components/resizer/HorizontalDivider";
export type { HorizontalDividerProps } from "./components/resizer/HorizontalDivider";

export { ResizeHandle } from "./components/resizer/ResizeHandle";
export type { ResizeHandleProps } from "./components/resizer/ResizeHandle";

// ============================================================================
// Public Hooks
// ============================================================================
export { useLayerDragHandle } from "./modules/grid/useLayerDragHandle";
