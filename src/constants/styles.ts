/**
 * @file Style constants for library components
 *
 * These constants reference CSS variables defined in variables.css.
 * This allows users to override theme values via CSS while maintaining
 * type-safe constants in TypeScript.
 *
 * All CSS variables use the unified prefix: --rpl- (react-panel-layout)
 * Users can override these via CSS variables (--rpl-*)
 *
 * @example
 * // In your CSS:
 * :root {
 *   --rpl-color-primary: #ff0000;
 * }
 */

// ========================================
// CSS VARIABLE PREFIX
// ========================================

/**
 * Unified CSS variable prefix for all react-panel-layout variables
 * All theme variables use this prefix: --rpl-*
 */
export const CSS_VAR_PREFIX = 'rpl';

// ========================================
// COLORS
// ========================================

/**
 * Tab colors - used in TabBar component
 */
export const COLOR_TAB_FG = "var(--rpl-color-tab-fg)";
export const COLOR_TAB_ACTIVE_BG = "var(--rpl-color-tab-active-bg)";
export const COLOR_TABBAR_BG = "var(--rpl-color-tabbar-bg)";

/**
 * Panel colors - used in panel layouts
 */
export const COLOR_PANEL_BORDER = "var(--rpl-color-panel-border)";
export const COLOR_PANEL_BG = "var(--rpl-color-panel-bg)";

/**
 * Primary color - used for resize handles, highlights
 */
export const COLOR_PRIMARY = "var(--rpl-color-primary)";
export const COLOR_RESIZE_HANDLE_HOVER = "var(--rpl-color-resize-handle-hover)";
export const COLOR_RESIZE_HANDLE_ACTIVE = "var(--rpl-color-resize-handle-active)";

/**
 * Drop suggestion overlay colors
 */
export const COLOR_DROP_SUGGEST_BORDER = "var(--rpl-color-drop-suggest-border)";
export const COLOR_DROP_SUGGEST_BG = "var(--rpl-color-drop-suggest-bg)";

/**
 * Tab drag overlay colors
 */
export const COLOR_TABDRAG_BG = "var(--rpl-color-tabdrag-bg)";
export const COLOR_TABDRAG_FG = "var(--rpl-color-tabdrag-fg)";
export const COLOR_TABDRAG_BORDER = "var(--rpl-color-tabdrag-border)";
export const COLOR_TABDRAG_SHADOW = "var(--rpl-color-tabdrag-shadow)";

/**
 * Insert guide colors
 */
export const COLOR_INSERT_GUIDE = "var(--rpl-color-insert-guide)";
export const COLOR_INSERT_GUIDE_SHADOW = "var(--rpl-color-insert-guide-shadow)";

/**
 * Node editor / floating panel colors
 * These are used by Drawer and FloatingPanelFrame components
 */
export const COLOR_NODE_EDITOR_SURFACE = "var(--rpl-color-surface)";
export const COLOR_NODE_EDITOR_SURFACE_2 = "var(--rpl-color-surface-2)";
export const COLOR_NODE_EDITOR_BORDER = "var(--rpl-color-border)";
export const COLOR_NODE_EDITOR_MUTED_FG = "var(--rpl-color-muted-fg)";
export const COLOR_NODE_EDITOR_CARD_SHADOW = "var(--rpl-shadow-card)";

// ========================================
// SIZING & SPACING
// ========================================

/**
 * Tab sizing
 */
export const SIZE_TAB_FONT = "var(--rpl-size-tab-font)";
export const SPACE_TAB_PADDING_Y = "var(--rpl-space-tab-padding-y)";
export const SPACE_TAB_PADDING_X = "var(--rpl-space-tab-padding-x)";

/**
 * Tabbar spacing
 */
export const SPACE_TABBAR_GAP = "var(--rpl-space-tabbar-gap)";
export const SPACE_TABBAR_PADDING_Y = "var(--rpl-space-tabbar-padding-y)";
export const SPACE_TABBAR_PADDING_X = "var(--rpl-space-tabbar-padding-x)";

/**
 * Border radius (decorative, using CSS variables)
 */
export const RADIUS_TAB = "var(--rpl-radius-tab)";
export const RADIUS_SUGGEST = "var(--rpl-radius-suggest)";

/**
 * Border widths
 */
export const SIZE_SUGGEST_BORDER = "var(--rpl-size-suggest-border)";

/**
 * Handle thicknesses
 * Note: SIZE_GRID_HANDLE_THICKNESS is kept as number for JavaScript calculations
 */
export const SIZE_GRID_HANDLE_THICKNESS = 4; // Used in GridTrackResizeHandle.tsx for offset calculation
export const SIZE_RESIZE_HANDLE_THICKNESS = "var(--rpl-size-resize-handle-thickness)";
export const SIZE_SPLIT_HANDLE_THICKNESS = "var(--rpl-size-split-handle-thickness)";

/**
 * Drop suggest padding
 */
export const SPACE_DROP_SUGGEST_PADDING = "var(--rpl-space-drop-suggest-padding)";

// ========================================
// Z-INDEXES
// ========================================

export const Z_OVERLAY = "var(--rpl-z-overlay)";
export const Z_TABDRAG_OVERLAY = "var(--rpl-z-tabdrag-overlay)";
export const Z_DIALOG_OVERLAY = "var(--rpl-z-dialog-overlay)";

// ========================================
// COMPONENT-SPECIFIC CONSTANTS
// ========================================

/**
 * Resize Handle
 */
export const RESIZE_HANDLE_THICKNESS = SIZE_RESIZE_HANDLE_THICKNESS;
export const RESIZE_HANDLE_Z_INDEX = "var(--rpl-z-resize-handle)";

/**
 * Grid Track Resize Handle
 */
export const GRID_HANDLE_THICKNESS = SIZE_GRID_HANDLE_THICKNESS;

/**
 * Grid Layer Resize Handles
 */
export const GRID_LAYER_CORNER_HIT_SIZE = "var(--rpl-size-grid-layer-corner-hit)";
export const GRID_LAYER_EDGE_HIT_THICKNESS = "var(--rpl-size-grid-layer-edge-hit-thickness)";

/**
 * Drop Suggest Overlay
 */
export const DROP_SUGGEST_Z_INDEX = Z_OVERLAY;
export const DROP_SUGGEST_BORDER_WIDTH = SIZE_SUGGEST_BORDER;
export const DROP_SUGGEST_BORDER_RADIUS = RADIUS_SUGGEST;
export const DROP_SUGGEST_BORDER_COLOR = COLOR_DROP_SUGGEST_BORDER;
export const DROP_SUGGEST_BG_COLOR = COLOR_DROP_SUGGEST_BG;
export const DROP_SUGGEST_PADDING = SPACE_DROP_SUGGEST_PADDING;
export const DROP_SUGGEST_PADDING_PX = 6;

/**
 * Tab Drag Overlay
 */
export const TAB_DRAG_OVERLAY_Z_INDEX = Z_TABDRAG_OVERLAY;
export const TAB_DRAG_PREVIEW_OFFSET_X = "var(--rpl-space-tab-drag-preview-offset-x)";
export const TAB_DRAG_PREVIEW_OFFSET_Y = "var(--rpl-space-tab-drag-preview-offset-y)";
export const TAB_DRAG_PREVIEW_BORDER_RADIUS = "var(--rpl-radius-tab-drag-preview)";
export const TAB_DRAG_PREVIEW_PADDING_Y = "var(--rpl-space-tab-drag-preview-padding-y)";
export const TAB_DRAG_PREVIEW_PADDING_X = "var(--rpl-space-tab-drag-preview-padding-x)";
export const TAB_DRAG_PREVIEW_FONT_SIZE = "var(--rpl-size-tab-drag-preview-font)";
export const TAB_DRAG_INSERT_GUIDE_WIDTH = "var(--rpl-size-tab-drag-insert-guide-width)";
export const TAB_DRAG_INSERT_GUIDE_BORDER_RADIUS = "var(--rpl-radius-tab-drag-insert-guide)";
export const TAB_DRAG_PREVIEW_BG_COLOR = COLOR_TABDRAG_BG;
export const TAB_DRAG_PREVIEW_FG_COLOR = COLOR_TABDRAG_FG;
export const TAB_DRAG_PREVIEW_BORDER_COLOR = COLOR_TABDRAG_BORDER;
export const TAB_DRAG_PREVIEW_SHADOW = COLOR_TABDRAG_SHADOW;
export const TAB_DRAG_INSERT_GUIDE_COLOR = COLOR_INSERT_GUIDE;
export const TAB_DRAG_INSERT_GUIDE_SHADOW = COLOR_INSERT_GUIDE_SHADOW;

/**
 * Dialog Overlay
 */
export const DIALOG_OVERLAY_Z_INDEX = Z_DIALOG_OVERLAY;

/**
 * Floating Panel Frame
 */
export const FLOATING_PANEL_BORDER_RADIUS = "var(--rpl-radius-floating-panel)";
export const FLOATING_PANEL_GAP = "var(--rpl-space-floating-panel-gap)";
export const FLOATING_PANEL_HEADER_PADDING_Y = "var(--rpl-space-floating-panel-header-padding-y)";
export const FLOATING_PANEL_HEADER_PADDING_X = "var(--rpl-space-floating-panel-header-padding-x)";
export const FLOATING_PANEL_CONTENT_PADDING = "var(--rpl-space-floating-panel-content-padding)";
export const FLOATING_PANEL_META_FONT_SIZE = "var(--rpl-size-floating-panel-meta-font)";
export const FLOATING_PANEL_CONTROLS_GAP = "var(--rpl-space-floating-panel-controls-gap)";
export const FLOATING_PANEL_SURFACE_COLOR = COLOR_NODE_EDITOR_SURFACE;
export const FLOATING_PANEL_SURFACE_2_COLOR = COLOR_NODE_EDITOR_SURFACE_2;
export const FLOATING_PANEL_BORDER_COLOR = COLOR_NODE_EDITOR_BORDER;
export const FLOATING_PANEL_MUTED_FG_COLOR = COLOR_NODE_EDITOR_MUTED_FG;
export const FLOATING_PANEL_SHADOW = COLOR_NODE_EDITOR_CARD_SHADOW;

/**
 * Drawer
 */
export const DRAWER_HEADER_PADDING_Y = "var(--rpl-space-drawer-header-padding-y)";
export const DRAWER_HEADER_PADDING_X = "var(--rpl-space-drawer-header-padding-x)";
export const DRAWER_HEADER_GAP = "var(--rpl-space-drawer-header-gap)";
export const DRAWER_CONTENT_PADDING = "var(--rpl-space-drawer-content-padding)";
export const DRAWER_CLOSE_BUTTON_FONT_SIZE = "var(--rpl-size-drawer-close-button-font)";
export const DRAWER_SURFACE_COLOR = COLOR_NODE_EDITOR_SURFACE;
export const DRAWER_BORDER_COLOR = COLOR_NODE_EDITOR_BORDER;
export const DRAWER_SHADOW = COLOR_NODE_EDITOR_CARD_SHADOW;

/**
 * Split Handles
 */
export const SPLIT_HANDLE_THICKNESS = SIZE_SPLIT_HANDLE_THICKNESS;

/**
 * HorizontalDivider
 */
export const HORIZONTAL_DIVIDER_WIDTH = "var(--rpl-size-horizontal-divider-width)";
export const HORIZONTAL_DIVIDER_HIT_AREA_OFFSET = "var(--rpl-space-horizontal-divider-hit-area-offset)";
