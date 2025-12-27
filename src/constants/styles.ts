/**
 * @file Style constants for library components
 *
 * All style values are defined here with CSS variable fallbacks.
 * Users can override these via CSS variables (--rpl-*).
 *
 * All CSS variables use the unified prefix: --rpl- (react-panel-layout)
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
export const CSS_VAR_PREFIX = "rpl";

// ========================================
// COLORS
// ========================================

/**
 * Tab colors - used in TabBar component
 */
export const COLOR_TAB_FG = "var(--rpl-color-tab-fg, #d5d7de)";
export const COLOR_TAB_ACTIVE_BG = "var(--rpl-color-tab-active-bg, #2b2d35)";
export const COLOR_TABBAR_BG = "var(--rpl-color-tabbar-bg, #1e1f24)";

/**
 * Panel colors - used in panel layouts
 */
export const COLOR_PANEL_BORDER = "var(--rpl-color-panel-border, rgba(0, 0, 0, 0.3))";
export const COLOR_PANEL_BG = "var(--rpl-color-panel-bg, #0b0b0c)";

/**
 * Primary color - used for resize handles, highlights
 */
export const COLOR_PRIMARY = "var(--rpl-color-primary, #2196f3)";
export const COLOR_RESIZE_HANDLE_IDLE = "var(--rpl-color-resize-handle-idle, rgba(255, 255, 255, 0.0))";
export const COLOR_RESIZE_HANDLE_HOVER = "var(--rpl-color-resize-handle-hover, rgba(33, 150, 243, 0.35))";
export const COLOR_RESIZE_HANDLE_ACTIVE = "var(--rpl-color-resize-handle-active, rgba(33, 150, 243, 0.55))";

/**
 * Drop suggestion overlay colors
 */
export const COLOR_DROP_SUGGEST_BORDER = "var(--rpl-color-drop-suggest-border, rgba(90, 150, 255, 0.9))";
export const COLOR_DROP_SUGGEST_BG = "var(--rpl-color-drop-suggest-bg, rgba(90, 150, 255, 0.15))";

/**
 * Tab drag overlay colors
 */
export const COLOR_TABDRAG_BG = "var(--rpl-color-tabdrag-bg, rgba(34, 36, 42, 0.95))";
export const COLOR_TABDRAG_FG = "var(--rpl-color-tabdrag-fg, #e9ebf0)";
export const COLOR_TABDRAG_BORDER = "var(--rpl-color-tabdrag-border, rgba(120, 160, 255, 0.6))";
export const COLOR_TABDRAG_SHADOW = "var(--rpl-color-tabdrag-shadow, 0 6px 20px rgba(0, 0, 0, 0.35))";

/**
 * Insert guide colors
 */
export const COLOR_INSERT_GUIDE = "var(--rpl-color-insert-guide, rgba(120, 160, 255, 0.95))";
export const COLOR_INSERT_GUIDE_SHADOW = "var(--rpl-color-insert-guide-shadow, 0 0 0 2px rgba(120, 160, 255, 0.2))";

/**
 * Node editor / floating panel colors
 * These are used by Drawer and FloatingPanelFrame components
 */
export const COLOR_NODE_EDITOR_SURFACE = "var(--rpl-color-surface, #fff)";
export const COLOR_NODE_EDITOR_SURFACE_2 = "var(--rpl-color-surface-2, #fafafa)";
export const COLOR_NODE_EDITOR_BORDER = "var(--rpl-color-border, #e5e7eb)";
export const COLOR_NODE_EDITOR_MUTED_FG = "var(--rpl-color-muted-fg, #6b7280)";
export const COLOR_NODE_EDITOR_CARD_SHADOW = "var(--rpl-shadow-card, 0 2px 10px rgba(0, 0, 0, 0.08))";
export const COLOR_DRAWER_BACKDROP = "var(--rpl-color-drawer-backdrop, rgba(0, 0, 0, 0.5))";

/**
 * Drawer transitions
 */
export const DRAWER_TRANSITION_DURATION = "var(--rpl-drawer-transition-duration, 220ms)";
export const DRAWER_TRANSITION_EASING = "var(--rpl-drawer-transition-easing, cubic-bezier(0.22, 1, 0.36, 1))";

/**
 * Pivot animations
 * User defines @keyframes in their CSS and references via these tokens.
 * - Enter: Applied when content becomes active
 * - Leave: Applied when content becomes inactive
 */
export const PIVOT_ANIMATION_ENTER = "var(--rpl-pivot-animation-enter, none)";
export const PIVOT_ANIMATION_LEAVE = "var(--rpl-pivot-animation-leave, none)";

/**
 * Pivot swipe animations
 * Used by SwipePivotContent for snap-back animation after swipe ends.
 */
export const PIVOT_SWIPE_SNAP_DURATION = "var(--rpl-pivot-swipe-snap-duration, 300ms)";
export const PIVOT_SWIPE_SNAP_EASING = "var(--rpl-pivot-swipe-snap-easing, cubic-bezier(0.22, 1, 0.36, 1))";

/**
 * Stack animations
 * User defines @keyframes in their CSS and references via these tokens.
 * - Push: Applied when a new panel is pushed onto the stack
 * - Pop: Applied when a panel is popped from the stack
 */
export const STACK_ANIMATION_PUSH = "var(--rpl-stack-animation-push, none)";
export const STACK_ANIMATION_POP = "var(--rpl-stack-animation-pop, none)";
export const STACK_TRANSITION_DURATION = "var(--rpl-stack-transition-duration, 350ms)";
export const STACK_TRANSITION_EASING = "var(--rpl-stack-transition-easing, cubic-bezier(0.32, 0.72, 0, 1))";

// ========================================
// SIZING & SPACING
// ========================================

/**
 * Tab sizing
 */
export const SIZE_TAB_FONT = "var(--rpl-size-tab-font, 12px)";
export const SPACE_TAB_PADDING_Y = "var(--rpl-space-tab-padding-y, 4px)";
export const SPACE_TAB_PADDING_X = "var(--rpl-space-tab-padding-x, 8px)";

/**
 * Tabbar spacing
 */
export const SPACE_TABBAR_GAP = "var(--rpl-space-tabbar-gap, 6px)";
export const SPACE_TABBAR_PADDING_Y = "var(--rpl-space-tabbar-padding-y, 4px)";
export const SPACE_TABBAR_PADDING_X = "var(--rpl-space-tabbar-padding-x, 6px)";

/**
 * Border radius (decorative, using CSS variables)
 */
export const RADIUS_TAB = "var(--rpl-radius-tab, 4px)";
export const RADIUS_SUGGEST = "var(--rpl-radius-suggest, 6px)";

/**
 * Border widths
 */
export const SIZE_SUGGEST_BORDER = "var(--rpl-size-suggest-border, 2px)";

/**
 * Handle thicknesses
 * Note: SIZE_GRID_HANDLE_THICKNESS is kept as number for JavaScript calculations
 */
export const SIZE_GRID_HANDLE_THICKNESS = 4; // Used in GridTrackResizeHandle.tsx for offset calculation
export const SIZE_RESIZE_HANDLE_THICKNESS = "var(--rpl-size-resize-handle-thickness, 4px)";
export const SIZE_SPLIT_HANDLE_THICKNESS = "var(--rpl-size-split-handle-thickness, 6px)";

/**
 * Drop suggest padding
 */
export const SPACE_DROP_SUGGEST_PADDING = "var(--rpl-space-drop-suggest-padding, 6px)";

// ========================================
// Z-INDEXES
// ========================================

export const Z_OVERLAY = "var(--rpl-z-overlay, 9998)";
export const Z_TABDRAG_OVERLAY = "var(--rpl-z-tabdrag-overlay, 9999)";
export const Z_DIALOG_OVERLAY = "var(--rpl-z-dialog-overlay, 10000)";

// ========================================
// COMPONENT-SPECIFIC CONSTANTS
// ========================================

/**
 * Resize Handle
 */
export const RESIZE_HANDLE_THICKNESS = SIZE_RESIZE_HANDLE_THICKNESS;
export const RESIZE_HANDLE_Z_INDEX = "var(--rpl-z-resize-handle, 1000)";

/**
 * Grid Track Resize Handle
 */
export const GRID_HANDLE_THICKNESS = SIZE_GRID_HANDLE_THICKNESS;

/**
 * Grid Layer Resize Handles
 */
export const GRID_LAYER_CORNER_HIT_SIZE = "var(--rpl-size-grid-layer-corner-hit, 14px)";
export const GRID_LAYER_EDGE_HIT_THICKNESS = "var(--rpl-size-grid-layer-edge-hit-thickness, 12px)";

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
export const TAB_DRAG_PREVIEW_OFFSET_X = "var(--rpl-space-tab-drag-preview-offset-x, 12px)";
export const TAB_DRAG_PREVIEW_OFFSET_Y = "var(--rpl-space-tab-drag-preview-offset-y, 12px)";
export const TAB_DRAG_PREVIEW_BORDER_RADIUS = "var(--rpl-radius-tab-drag-preview, 6px)";
export const TAB_DRAG_PREVIEW_PADDING_Y = "var(--rpl-space-tab-drag-preview-padding-y, 4px)";
export const TAB_DRAG_PREVIEW_PADDING_X = "var(--rpl-space-tab-drag-preview-padding-x, 8px)";
export const TAB_DRAG_PREVIEW_FONT_SIZE = "var(--rpl-size-tab-drag-preview-font, 12px)";
export const TAB_DRAG_INSERT_GUIDE_WIDTH = "var(--rpl-size-tab-drag-insert-guide-width, 2px)";
export const TAB_DRAG_INSERT_GUIDE_BORDER_RADIUS = "var(--rpl-radius-tab-drag-insert-guide, 1px)";
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
export const FLOATING_PANEL_BORDER_RADIUS = "var(--rpl-radius-floating-panel, 8px)";
export const FLOATING_PANEL_GAP = "var(--rpl-space-floating-panel-gap, 8px)";
export const FLOATING_PANEL_HEADER_PADDING_Y = "var(--rpl-space-floating-panel-header-padding-y, 8px)";
export const FLOATING_PANEL_HEADER_PADDING_X = "var(--rpl-space-floating-panel-header-padding-x, 12px)";
export const FLOATING_PANEL_CONTENT_PADDING = "var(--rpl-space-floating-panel-content-padding, 12px)";
export const FLOATING_PANEL_META_FONT_SIZE = "var(--rpl-size-floating-panel-meta-font, 12px)";
export const FLOATING_PANEL_CONTROLS_GAP = "var(--rpl-space-floating-panel-controls-gap, 6px)";
export const FLOATING_PANEL_CLOSE_BUTTON_FONT_SIZE = "var(--rpl-size-floating-panel-close-button-font, 1.25rem)";
export const FLOATING_PANEL_CLOSE_BUTTON_PADDING =
  "var(--rpl-space-floating-panel-close-button-padding, 0.25rem 0.5rem)";
export const FLOATING_PANEL_SURFACE_COLOR = COLOR_NODE_EDITOR_SURFACE;
export const FLOATING_PANEL_SURFACE_2_COLOR = COLOR_NODE_EDITOR_SURFACE_2;
export const FLOATING_PANEL_BORDER_COLOR = COLOR_NODE_EDITOR_BORDER;
export const FLOATING_PANEL_MUTED_FG_COLOR = COLOR_NODE_EDITOR_MUTED_FG;
export const FLOATING_PANEL_SHADOW = COLOR_NODE_EDITOR_CARD_SHADOW;

/**
 * Drawer
 */
export const DRAWER_HEADER_PADDING_Y = "var(--rpl-space-drawer-header-padding-y, 10px)";
export const DRAWER_HEADER_PADDING_X = "var(--rpl-space-drawer-header-padding-x, 12px)";
export const DRAWER_HEADER_GAP = "var(--rpl-space-drawer-header-gap, 8px)";
export const DRAWER_CONTENT_PADDING = "var(--rpl-space-drawer-content-padding, 12px)";
export const DRAWER_CLOSE_BUTTON_FONT_SIZE = "var(--rpl-size-drawer-close-button-font, 18px)";
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
export const HORIZONTAL_DIVIDER_WIDTH = "var(--rpl-size-horizontal-divider-width, 4px)";
export const HORIZONTAL_DIVIDER_HIT_AREA_OFFSET = "var(--rpl-space-horizontal-divider-hit-area-offset, 4px)";

/**
 * Modal
 */
export const COLOR_MODAL_BACKDROP = "var(--rpl-color-modal-backdrop, rgba(0, 0, 0, 0.5))";
export const MODAL_TRANSITION_DURATION = "var(--rpl-modal-transition-duration, 200ms)";
export const MODAL_TRANSITION_EASING = "var(--rpl-modal-transition-easing, ease-out)";
export const MODAL_MIN_WIDTH = "var(--rpl-modal-min-width, 280px)";
export const MODAL_MAX_WIDTH = "var(--rpl-modal-max-width, 90vw)";
export const MODAL_MAX_HEIGHT = "var(--rpl-modal-max-height, 85vh)";

/**
 * Alert Dialog
 */
export const ALERT_DIALOG_WIDTH = "var(--rpl-alert-dialog-width, 320px)";
export const ALERT_DIALOG_BUTTON_GAP = "var(--rpl-alert-dialog-button-gap, 8px)";
export const ALERT_DIALOG_ACTIONS_PADDING = "var(--rpl-alert-dialog-actions-padding, 12px)";
export const ALERT_DIALOG_MESSAGE_PADDING = "var(--rpl-alert-dialog-message-padding, 16px)";
export const ALERT_DIALOG_INPUT_MARGIN_TOP = "var(--rpl-alert-dialog-input-margin-top, 12px)";
