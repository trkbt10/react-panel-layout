/**
 * @file Shared types used across window/grid modules.
 */

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
  onStateChange?: (open: boolean) => void;
  header?: {
    title?: string;
    showCloseButton?: boolean;
  };
};
