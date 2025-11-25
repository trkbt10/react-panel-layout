/**
 * @file Unified public type definitions for the panel layout system.
 * Single source of truth for grid, window, and drawer related types.
 */
import * as React from "react";

// ============================================================================
// Window / Popup / Drawer types (formerly src/modules/types.ts)
// ============================================================================

// Basic coordinates used by overlays and anchors
export type Position = {
  x: number;
  y: number;
};

// Offset value used when positioning floating windows
export type WindowOffset = number | string;

// CSS-like position offsets for floating windows
export type WindowPosition = {
  top?: WindowOffset;
  right?: WindowOffset;
  bottom?: WindowOffset;
  left?: WindowOffset;
};

// Explicit dimensions for floating windows
export type WindowSize = {
  width: number;
  height: number;
};

// Complete bounds definition for floating windows
export type WindowBounds = {
  position?: WindowPosition;
  size: WindowSize;
};

// Size constraints that can be applied to floating/drawer surfaces
export type WindowConstraints = {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
};

// Browser popup window features
export type PopupWindowFeatures = {
  toolbar?: boolean;
  menubar?: boolean;
  location?: boolean;
  status?: boolean;
  resizable?: boolean;
  scrollbars?: boolean;
};

// Extra configuration for browser popup windows
export type PopupWindowOptions = {
  name?: string;
  features?: PopupWindowFeatures;
  focus?: boolean;
  closeOnUnmount?: boolean;
  createWindow?: (config: PopupWindowFactoryConfig) => Window | null;
};

// Parameters for creating popup windows via a custom factory
export type PopupWindowFactoryConfig = {
  name: string;
  features: string;
  bounds: WindowBounds;
};

// Display mode for floating windows
export type FloatingWindowMode = "embedded" | "popup";

// Unified configuration for floating windows (embedded or popup)
export type FloatingWindowConfig = {
  mode?: FloatingWindowMode;
  draggable?: boolean;
  resizable?: boolean;
  constraints?: WindowConstraints;
  onMove?: (position: WindowPosition) => void;
  onResize?: (size: WindowSize) => void;
  popup?: PopupWindowOptions;
};

// Drawer behavior configuration for mobile-friendly slide-in panels
export type DrawerBehavior = {
  /** Optional controlled state */
  defaultOpen?: boolean;
  open?: boolean;
  /** Whether clicking backdrop dismisses the drawer */
  dismissible?: boolean;
  /**
   * Transition mode for drawer visibility.
   * - "css" (default) uses CSS transform transitions.
   * - "none" disables transitions.
   */
  transitionMode?: "css" | "none";
  /** Override transform transition duration (e.g., "240ms"). */
  transitionDuration?: string;
  /** Override transform transition easing (e.g., "cubic-bezier(0.22,1,0.36,1)"). */
  transitionEasing?: string;
  onStateChange?: (open: boolean) => void;
  /** Use the built-in chrome (background, header padding). Defaults to true. */
  chrome?: boolean;
  /**
   * Render the drawer relative to its parent container instead of the viewport.
   * Defaults to false (fixed to viewport).
   */
  inline?: boolean;
  /**
   * Accessible label when header.title is not provided or when rendering without a header.
   */
  ariaLabel?: string;
  header?: {
    title?: string;
    showCloseButton?: boolean;
  };
};

// ============================================================================
// Grid / Panel layout types (formerly src/panel-system/types.ts)
// ============================================================================

// Grid track definition with optional resize capability
export type GridTrack = {
  size: string;
  resizable?: boolean;
  minSize?: number;
  maxSize?: number;
};

// Grid-based layout configuration for the editor
export type PanelLayoutConfig = {
  areas: string[][];
  rows: GridTrack[];
  columns: GridTrack[];
  gap?: string;
  style?: React.CSSProperties;
};

// Layer positioning mode
export type LayerPositionMode = "grid" | "absolute" | "relative" | "fixed";

// Layer definition for panel system
export type LayerDefinition = {
  id: string;
  component: React.ReactNode;
  visible?: boolean;

  // Grid positioning
  gridArea?: string;
  gridRow?: string;
  gridColumn?: string;

  // Absolute/Fixed/Relative positioning
  /**
   * Positioning mode: when omitted, derived automatically.
   * If `floating` is present, behaves as absolute (embedded) or relative (popup).
   */
  positionMode?: LayerPositionMode;
  /** Absolute/fixed offsets when positionMode !== 'grid'. */
  position?: WindowPosition;

  // Stacking and dimensions (applies when not using floating.bounds)
  zIndex?: number;
  width?: string | number;
  height?: string | number;
  pointerEvents?: boolean | "auto" | "none";
  /** Optional backdrop style (used by DrawerBehaviour) */
  backdropStyle?: React.CSSProperties;

  // Behaviors
  drawer?: DrawerBehavior;
  floating?: FloatingWindowConfig;

  // Styling
  style?: React.CSSProperties;
};

// Props for top-level layout components
export type PanelLayoutProps = {
  config: PanelLayoutConfig;
  layers: LayerDefinition[];
};
