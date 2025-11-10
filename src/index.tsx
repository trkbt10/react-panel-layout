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
export {
  PanelLayoutRouter,
  buildLayersFromRoutes,
  createPanelLayoutFromRoutes,
} from "./config/panelRouter";
export type { PanelRoute, PanelLayoutRouterProps } from "./config/panelRouter";

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

// ============================================================================
// VSCode-like Panel System (tabs + splits)
// ============================================================================
export { PanelSystem } from "./components/panels/PanelSystem";
export { buildInitialState as buildPanelInitialState } from "./components/panels/PanelSystem";
export { createPanelView } from "./components/panels/createPanelView";
export type {
  PanelSystemProps as VSCodePanelSystemProps,
  PanelSystemState as VSCodePanelSystemState,
  GroupModel as VSCodePanelGroupModel,
  TabDefinition as VSCodePanelTab,
  SplitDirection as VSCodeSplitDirection,
  TabBarRenderProps,
  PanelGroupRenderProps,
} from "./modules/panels/state/types";

// ============================================================================
// Theme (Design Tokens)
// ============================================================================
export { PanelThemeProvider, defaultPanelDesignTokens } from "./modules/theme/tokens";
export type { PanelDesignTokens } from "./modules/theme/tokens";
export { raisedPanelDesignTokens } from "./modules/theme/tokens";
