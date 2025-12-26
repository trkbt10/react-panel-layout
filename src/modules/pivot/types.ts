/**
 * @file Type definitions for the Pivot headless component system.
 * Pivot manages content switching within a scope without providing UI.
 */
import type * as React from "react";

/**
 * Navigation mode for pivot.
 * - "linear": Default. Stops at first/last item.
 * - "loop": Infinite loop. Navigation wraps around.
 */
export type PivotNavigationMode = "linear" | "loop";

/**
 * A single content item that can be displayed in a Pivot.
 */
export type PivotItem<TId extends string = string> = {
  /** Unique identifier for this content item */
  id: TId;
  /** Human-readable label (optional - for tab titles, menu items, etc.) */
  label?: string;
  /** The actual content to render when this item is active */
  content: React.ReactNode;
  /** Whether this item can be selected (defaults to true) */
  disabled?: boolean;
  /**
   * Enable content caching to preserve React component state across re-renders.
   * When disabled (default), content is re-created on each render.
   * @default false
   */
  cache?: boolean;
};

/**
 * Props for the usePivot hook.
 */
export type UsePivotOptions<TId extends string = string> = {
  /** Array of content items to manage */
  items: ReadonlyArray<PivotItem<TId>>;
  /** Currently active item ID (controlled mode) */
  activeId?: TId;
  /** Default active item ID (uncontrolled mode) */
  defaultActiveId?: TId;
  /** Callback when active item changes */
  onActiveChange?: (id: TId) => void;
  /**
   * Transition mode for content switching.
   * - "css" (default) uses CSS transitions with design tokens.
   * - "none" disables transitions (uses React.Activity for memory optimization).
   */
  transitionMode?: "css" | "none";
  /**
   * Navigation mode for pivot.
   * - "linear" (default): Stops at first/last item.
   * - "loop": Navigation wraps around (last→first, first→last).
   */
  navigationMode?: PivotNavigationMode;
};

/**
 * Props object returned by getItemProps for navigation elements.
 */
export type PivotItemProps = {
  "data-pivot-item": string;
  "data-active": "true" | "false";
  "aria-selected": boolean;
  tabIndex: number;
  onClick: () => void;
};

/**
 * Options for navigation methods (go, setActiveId).
 */
export type PivotNavigationOptions = {
  /**
   * Whether to animate the transition.
   * - undefined: use transitionMode setting (default)
   * - true: force animation
   * - false: instant transition without animation
   */
  animated?: boolean;
};

/**
 * Result from usePivot hook.
 */
export type UsePivotResult<TId extends string = string> = {
  /** Current active item ID */
  activeId: TId;
  /**
   * Function to change the active item.
   * @param id - Target item ID
   * @param options - Navigation options (animated, etc.)
   */
  setActiveId: (id: TId, options?: PivotNavigationOptions) => void;
  /** Helper to check if an item is active */
  isActive: (id: TId) => boolean;
  /** Function to get props for navigation items (buttons, links, etc.) */
  getItemProps: (id: TId) => PivotItemProps;
  /** Outlet component that renders the active content (react-router style) */
  Outlet: React.FC;
  /**
   * Navigate in a direction relative to the current item.
   * @param direction - Number of items to move: -1=prev, 1=next, -2=skip2Back, etc.
   * @param options - Navigation options (animated, etc.)
   */
  go: (direction: number, options?: PivotNavigationOptions) => void;
  /**
   * Check if navigation in a direction is possible.
   * @param direction - Direction to check
   * @returns true if navigation is possible
   */
  canGo: (direction: number) => boolean;
  /** Current index of active item in the items array */
  activeIndex: number;
  /** Total number of enabled items */
  itemCount: number;
  /** Whether a transition animation is currently in progress */
  isAnimating: boolean;
  /** Call to signal that animation has completed */
  endAnimation: () => void;
  /** Current navigation mode */
  navigationMode: PivotNavigationMode;
  /**
   * Get the virtual position for an item relative to active.
   * In loop mode, this wraps: item at index 0 can have position 1 if active is last.
   * @param id - Item ID to check
   * @returns -1 (prev), 0 (active), 1 (next), or null if not adjacent
   */
  getVirtualPosition: (id: TId) => -1 | 0 | 1 | null;
  /**
   * Get the position for any item relative to active.
   * Unlike getVirtualPosition, returns positions for all items (not just adjacent).
   * In loop mode, returns the shortest path position (e.g., last→first is +1, not -(count-1)).
   * @param id - Item ID to check
   * @returns Position offset from active, or null if item not found
   */
  getItemPosition: (id: TId) => number | null;
};
