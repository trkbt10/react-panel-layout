/**
 * @file Core panel system type definitions (independent of grid module).
 */
import * as React from "react";
import type { DrawerBehavior, FloatingWindowConfig, WindowPosition } from "../modules/types";

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

