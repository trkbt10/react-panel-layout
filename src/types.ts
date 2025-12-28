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

// Floating window header configuration
export type FloatingHeaderConfig = {
  /** Header title text */
  title?: string;
  /** Show close button (requires onClose callback) */
  showCloseButton?: boolean;
};

// Unified configuration for floating windows with controlled/uncontrolled support
export type FloatingBehavior = {
  // === Position (controlled/uncontrolled) ===
  /** Controlled position - when defined, component uses this value directly */
  position?: WindowPosition;
  /** Initial position for uncontrolled mode */
  defaultPosition?: WindowPosition;

  // === Size (controlled/uncontrolled) ===
  /** Controlled size - when defined, component uses this value directly */
  size?: WindowSize;
  /** Initial size for uncontrolled mode */
  defaultSize?: WindowSize;

  // === Stacking ===
  /** Z-index for stacking order */
  zIndex?: number;

  // === Interaction ===
  /** Enable drag-to-move functionality */
  draggable?: boolean;
  /** Enable resize handles */
  resizable?: boolean;
  /** Size constraints for resizing */
  constraints?: WindowConstraints;

  // === Callbacks ===
  /** Called when position changes (drag/move) */
  onMove?: (position: WindowPosition) => void;
  /** Called when size changes (resize) */
  onResize?: (size: WindowSize) => void;
  /** Called when close button is clicked */
  onClose?: () => void;

  // === Chrome (like DrawerBehavior) ===
  /**
   * Use built-in chrome (FloatingPanelFrame with border, shadow, background).
   * When true and header is provided, header auto-enables drag handle.
   * Defaults to false.
   */
  chrome?: boolean;
  /**
   * Header configuration (renders header when provided).
   * When chrome is true and header is provided, header becomes the drag handle.
   */
  header?: FloatingHeaderConfig;
  /** Accessible label when header.title is not provided */
  ariaLabel?: string;

  // === Transitions ===
  /**
   * Transition mode for position/size changes.
   * - "css" uses CSS transitions.
   * - "none" disables transitions.
   */
  transitionMode?: "css" | "none";
  /** Override transition duration (e.g., "200ms") */
  transitionDuration?: string;
  /** Override transition easing (e.g., "ease-out") */
  transitionEasing?: string;

  // === Display mode ===
  /** Display mode: "embedded" (default) or "popup" (browser window) */
  mode?: FloatingWindowMode;
  /** Popup-specific options when mode is "popup" */
  popup?: PopupWindowOptions;
};

// Pivot item definition for content switching
export type PivotBehaviorItem = {
  /** Unique identifier for this content item */
  id: string;
  /** Human-readable label (optional) */
  label?: string;
  /** The actual content to render when this item is active */
  content: React.ReactNode;
  /** Whether this item can be selected */
  disabled?: boolean;
  /**
   * Enable content caching to preserve React component state across re-renders.
   * When disabled (default), content is re-created on each render.
   * @default false
   */
  cache?: boolean;
};

// Pivot behavior configuration for content switching
export type PivotBehavior = {
  /** Array of content items to switch between */
  items: PivotBehaviorItem[];
  /** Currently active item ID (controlled mode) */
  activeId?: string;
  /** Default active item ID (uncontrolled mode) */
  defaultActiveId?: string;
  /** Callback when active item changes */
  onActiveChange?: (id: string) => void;
  /**
   * Transition mode for content switching.
   * - "css" (default) uses CSS transitions via design tokens.
   * - "none" disables transitions (uses React.Activity for memory optimization).
   */
  transitionMode?: "css" | "none";
};

// Drawer behavior configuration for mobile-friendly slide-in panels
export type DrawerBehavior = {
  /** Optional controlled state */
  defaultOpen?: boolean;
  open?: boolean;
  /** Whether clicking backdrop dismisses the drawer */
  dismissible?: boolean;
  /**
   * Anchor edge for the drawer.
   * - "left", "right", "top", "bottom"
   * - When not specified, inferred from position prop
   */
  anchor?: "left" | "right" | "top" | "bottom";
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
  /**
   * Enable swipe gestures for opening/closing the drawer.
   * - true: Enable both edge-swipe-to-open and swipe-to-close
   * - false: Disable swipe gestures (default)
   * - Object: Fine-grained control over swipe behavior
   */
  swipeGestures?:
    | boolean
    | {
        /** Enable edge swipe from container to open. @default true */
        edgeSwipeOpen?: boolean;
        /** Enable swipe within drawer to close. @default true */
        swipeClose?: boolean;
        /** Width of edge detection zone in pixels. @default 20 */
        edgeWidth?: number;
        /** Threshold ratio (0-1) to trigger close. @default 0.3 */
        dismissThreshold?: number;
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
  /**
   * Position offsets for non-floating layers (drawer, absolute positioned).
   * For floating layers, use `floating.position` or `floating.defaultPosition` instead.
   */
  position?: WindowPosition;

  /**
   * Stacking order for non-floating layers.
   * For floating layers, use `floating.zIndex` instead.
   */
  zIndex?: number;
  /**
   * Width for non-floating layers.
   * For floating layers, use `floating.size` or `floating.defaultSize` instead.
   */
  width?: string | number;
  /**
   * Height for non-floating layers.
   * For floating layers, use `floating.size` or `floating.defaultSize` instead.
   */
  height?: string | number;
  pointerEvents?: boolean | "auto" | "none";
  /** Optional backdrop style (used by DrawerBehaviour) */
  backdropStyle?: React.CSSProperties;

  // Behaviors
  drawer?: DrawerBehavior;
  /** Floating window behavior configuration */
  floating?: FloatingBehavior;
  pivot?: PivotBehavior;

  // Styling
  style?: React.CSSProperties;

  /**
   * When true, enables scrolling within this panel (overflow: auto).
   * When false or omitted, content overflow is hidden (default behavior).
   */
  scrollable?: boolean;

  /**
   * Enable content caching to preserve React component state across re-renders.
   * When disabled (default), content is re-created on each render.
   * @default false
   */
  cache?: boolean;
};

// Props for top-level layout components
export type PanelLayoutProps = {
  config: PanelLayoutConfig;
  layers: LayerDefinition[];
};
