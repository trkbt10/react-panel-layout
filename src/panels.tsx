/**
 * @file Type definitions for panel and grid-based layout system
 */
import * as React from "react";

/**
 * Position coordinates
 */
export type Position = {
  x: number;
  y: number;
};

/**
 * Offset value used when positioning floating windows.
 * Numbers are treated as pixel values while strings are passed through.
 */
export type WindowOffset = number | string;

/**
 * CSS-like position offsets for floating windows.
 */
export type WindowPosition = {
  top?: WindowOffset;
  right?: WindowOffset;
  bottom?: WindowOffset;
  left?: WindowOffset;
};

/**
 * Explicit dimensions for floating windows.
 */
export type WindowSize = {
  width: number;
  height: number;
};

/**
 * Complete bounds definition for floating windows.
 */
export type WindowBounds = {
  position?: WindowPosition;
  size: WindowSize;
};

/**
 * Size constraints that can be applied to floating windows.
 */
export type WindowConstraints = {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
};

/**
 * Controllable popup window feature toggles.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/open#window_features}
 */
export type PopupWindowFeatures = {
  toolbar?: boolean;
  menubar?: boolean;
  location?: boolean;
  status?: boolean;
  resizable?: boolean;
  scrollbars?: boolean;
};

/**
 * Extra configuration applied when rendering floating windows as browser popups.
 */
export type PopupWindowOptions = {
  /** Optional window name used when calling window.open (reuses existing window with the same name). */
  name?: string;
  /** Feature overrides passed to window.open (toolbar, menubar, etc.). */
  features?: PopupWindowFeatures;
  /** Whether to focus the popup once it opens. Defaults to true. */
  focus?: boolean;
  /** Whether to close the popup when the layer unmounts. Defaults to true. */
  closeOnUnmount?: boolean;
  /** Optional factory used to create the popup window (primarily for testing environments). */
  createWindow?: (config: PopupWindowFactoryConfig) => Window | null;
};

/**
 * Parameters provided when creating a popup window via a custom factory.
 */
export type PopupWindowFactoryConfig = {
  name: string;
  features: string;
  bounds: WindowBounds;
};

/**
 * Display mode for floating windows.
 * - "embedded" renders within the current document (previous floating behaviour).
 * - "popup" opens a dedicated browser window.
 */
export type FloatingWindowMode = "embedded" | "popup";

/**
 * Unified configuration for floating windows (either embedded or popup).
 */
export type FloatingWindowConfig = {
  /** Rendering mode (embedded within layout or browser popup). */
  mode?: FloatingWindowMode;
  /** Position and size bounds for the floating window. */
  bounds: WindowBounds;
  /** Z-index override specific to this floating window. */
  zIndex?: number;
  /** Enable drag interactions for embedded mode floating windows. */
  draggable?: boolean;
  /** Enable resize interactions for embedded mode floating windows. */
  resizable?: boolean;
  /** Optional size constraints applied during resize interactions. */
  constraints?: WindowConstraints;
  /** Callback invoked when the floating window moves. */
  onMove?: (position: WindowPosition) => void;
  /** Callback invoked when the floating window is resized. */
  onResize?: (size: WindowSize) => void;
  /** Popup-specific options when mode is set to "popup". */
  popup?: PopupWindowOptions;
};

/**
 * Panel position - either a named column position or floating coordinates
 * - 'left': Dock to left side
 * - 'right': Dock to right side
 * - { x, y }: Float at specific coordinates
 */
export type PanelPosition = "left" | "right" | Position;

/**
 * Configuration for a single panel
 */
export type PanelDefinition = {
  /** Panel component/content */
  component: React.ReactNode;
  /** Panel position - column ('left'/'right') or floating coordinates */
  position: PanelPosition;
  /** Whether the panel is initially visible */
  visible?: boolean;

  // Column layout options (when position is 'left' or 'right')
  /** Initial width in pixels (for column layout) */
  initialWidth?: number;
  /** Minimum width in pixels (for column layout) */
  minWidth?: number;
  /** Maximum width in pixels (for column layout) */
  maxWidth?: number;
  /** Whether the panel can be resized (for column layout) */
  resizable?: boolean;
  /** Callback when panel width changes (column mode) */
  onWidthChange?: (width: number) => void;

  /** Floating window configuration when the panel is not docked */
  floating?: FloatingWindowConfig;
};

/**
 * Configuration for editor panels - dictionary of labeled panels
 * Each key is a unique label for the panel, value is the panel definition
 *
 * @example
 * ```tsx
 * panels={{
 *   inspector: {
 *     component: <InspectorPanel />,
 *     position: 'right',
 *     initialWidth: 320,
 *   },
 *   library: {
 *     component: <LibraryPanel />,
 *     position: { x: 20, y: 80 },
 *     floating: {
 *       bounds: {
 *         position: { left: 20, top: 80 },
 *         size: { width: 280, height: 500 },
 *       },
 *       draggable: true,
 *     },
 *   }
 * }}
 * ```
 */
export type EditorPanelsConfig = Record<string, PanelDefinition>;

// ==================== NEW GRID-BASED LAYOUT SYSTEM ====================

/**
 * Grid track definition with optional resize capability
 */
export type GridTrack = {
  /** Track size (e.g., "1fr", "300px", "auto") */
  size: string;
  /** Whether this track can be resized */
  resizable?: boolean;
  /** Minimum size in pixels (only applies if resizable) */
  minSize?: number;
  /** Maximum size in pixels (only applies if resizable) */
  maxSize?: number;
};

/**
 * Grid-based layout configuration for the editor
 */
export type PanelLayoutConfig = {
  /** Grid template areas as 2D array. Example: [["canvas", "inspector"], ["statusbar", "statusbar"]] */
  areas: string[][];
  /** Row track definitions */
  rows: GridTrack[];
  /** Column track definitions */
  columns: GridTrack[];
  /** CSS gap between grid cells */
  gap?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
};

/**
 * Layer positioning mode
 * - 'grid': Use CSS Grid positioning (gridArea, gridRow, gridColumn)
 * - 'absolute': Position absolutely within parent
 * - 'relative': Position relative to normal flow
 * - 'fixed': Position fixed to viewport
 */
export type LayerPositionMode = "grid" | "absolute" | "relative" | "fixed";

/**
 * Drawer behavior configuration
 * Controls how a layer behaves as a mobile-friendly drawer
 */
export type DrawerBehavior = {
  /** Drawer placement direction */
  placement: "top" | "right" | "bottom" | "left";
  /** Initial state (open/closed) */
  defaultOpen?: boolean;
  /** Controlled open state (when provided, drawer becomes controlled) */
  open?: boolean;
  /** Whether drawer can be dismissed by clicking outside */
  dismissible?: boolean;
  /** Whether to show a backdrop/overlay */
  showBackdrop?: boolean;
  /** Backdrop opacity (0-1) */
  backdropOpacity?: number;
  /** Size when open (pixels or percentage) */
  size?: string | number;
  /** Callback when drawer state changes */
  onStateChange?: (open: boolean) => void;
  /** Header configuration for drawer */
  header?: {
    /** Header title text */
    title?: string;
    /** Whether to show close button in header (default: true if header is provided) */
    showCloseButton?: boolean;
  };
};

/**
 * Layer definition for grid-based layout system
 * Combines background layers, overlay layers, UI layers, and main canvas into unified system
 */
export type LayerDefinition = {
  /** Unique identifier for the layer */
  id: string;
  /** Layer content/component */
  component: React.ReactNode;
  /** Whether the layer is visible */
  visible?: boolean;

  // Grid positioning (when positionMode is 'grid')
  /** CSS grid-area name */
  gridArea?: string;
  /** CSS grid-row value */
  gridRow?: string;
  /** CSS grid-column value */
  gridColumn?: string;

  // Absolute/Fixed/Relative positioning
  /** Positioning mode */
  positionMode?: LayerPositionMode;
  /**
   * Position coordinates (for absolute/fixed/relative modes)
   * - Numbers are converted to px (e.g., `100` → `100px`)
   * - Strings are used as-is, supporting %, calc(), vw, vh, etc.
   *
   * @example
   * ```tsx
   * // Pixel positioning
   * position: { top: 20, left: 100 }
   *
   * // Percentage positioning
   * position: { left: "50%", top: "25%" }
   *
   * // Centered with transform
   * position: { left: "50%", top: "50%" }
   * // Note: Use layer.style for transform: { transform: "translate(-50%, -50%)" }
   *
   * // Mixed units
   * position: { top: "10vh", right: 20 }
   *
   * // CSS calc()
   * position: { left: "calc(50% - 160px)", top: 0 }
   * ```
   */
  position?: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };

  // Stacking and dimensions
  /** Z-index for stacking order */
  zIndex?: number;
  /** Width (CSS value or pixels) */
  width?: string | number;
  /** Height (CSS value or pixels) */
  height?: string | number;

  /** Whether the layer blocks pointer events (default: true for absolute/fixed, false for grid) */
  pointerEvents?: boolean | "auto" | "none";

  /** Drawer behavior for mobile-friendly slide-in panels */
  drawer?: DrawerBehavior;

  /** Floating window configuration for overlay/popup rendering */
  floating?: FloatingWindowConfig;

  // Styling
  /** Custom inline styles */
  style?: React.CSSProperties;
};

/**
 * Configuration for grid-based editor layout
 * Replaces overlayLayers, backgroundLayers, uiOverlayLayers, and main canvas with unified layer system
 *
 * @example
 * ```tsx
 * gridLayout={{
 *   config: {
 *     areas: `
 *       "toolbar toolbar toolbar"
 *       "sidebar canvas inspector"
 *       "statusbar statusbar statusbar"
 *     `,
 *     rows: "auto 1fr auto",
 *     columns: "250px 1fr 320px",
 *     gap: "0",
 *   },
 *   layers: [
 *     {
 *       id: "canvas",
 *       component: <CanvasBase />,
 *       gridArea: "canvas",
 *       zIndex: 0,
 *     },
 *     {
 *       id: "toolbar",
 *       component: <Toolbar />,
 *       gridArea: "toolbar",
 *       zIndex: 1,
 *     },
 *     {
 *       id: "background-grid",
 *       component: <BackgroundGrid />,
 *       gridArea: "canvas",
 *       zIndex: -1,
 *       pointerEvents: false,
 *     },
 *   ]
 * }}
 * ```
 */
export type PanelLayoutProps = {
  /** Grid layout configuration */
  config: PanelLayoutConfig;
  /** Layers to render in the grid */
  layers: LayerDefinition[];
};
