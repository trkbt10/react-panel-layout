/**
 * @file Types for the legacy/editor panels (non-grid) configuration.
 */
import * as React from "react";
import type { Position, FloatingWindowConfig } from "../window/types";

// Panel position - either a named column position or floating coordinates
export type PanelPosition = "left" | "right" | Position;

// Configuration for a single panel
export type PanelDefinition = {
  component: React.ReactNode;
  position: PanelPosition;
  visible?: boolean;

  // Column layout options (when position is 'left' or 'right')
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  onWidthChange?: (width: number) => void;

  // Floating window configuration when the panel is not docked
  floating?: FloatingWindowConfig;
};

// Configuration map for editor panels
export type EditorPanelsConfig = Record<string, PanelDefinition>;

