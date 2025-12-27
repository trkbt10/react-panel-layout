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
  FloatingBehavior,
  FloatingHeaderConfig,
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
// Floating Window Components
// ============================================================================
export { FloatingWindow } from "./components/window/FloatingWindow";
export type { FloatingWindowProps } from "./components/window/FloatingWindow";

// ============================================================================
// Panel Components
// ============================================================================
export { HorizontalDivider } from "./components/resizer/HorizontalDivider";
export type { HorizontalDividerProps } from "./components/resizer/HorizontalDivider";

export { ResizeHandle } from "./components/resizer/ResizeHandle";
export type { ResizeHandleProps } from "./components/resizer/ResizeHandle";

// ============================================================================
// Public Hooks
// ============================================================================
export { useLayerDragHandle } from "./modules/grid/useLayerDragHandle";
export { useFloatingState } from "./modules/window/useFloatingState";
export { useTransitionState, runTransition } from "./hooks/useTransitionState";
export type { TransitionMode, TransitionOptions, UseTransitionStateOptions } from "./hooks/useTransitionState";

// ============================================================================
// Style Constants
// ============================================================================
export { CSS_VAR_PREFIX } from "./constants/styles";

// ============================================================================
// Panel System (tabs + splits)
// ============================================================================
export { PanelSystem } from "./modules/panels/system/PanelSystem";
export { buildInitialState } from "./modules/panels";
export type {
  PanelSystemProps,
  PanelSystemState,
  GroupModel,
  TabDefinition,
  SplitDirection,
  TabBarRenderProps,
  PanelGroupRenderProps,
  PanelSplitLimits,
} from "./modules/panels/state/types";

