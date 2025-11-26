/**
 * @file Type definitions for the Pivot headless component system.
 * Pivot manages content switching within a scope without providing UI.
 */
import type * as React from "react";

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
 * Result from usePivot hook.
 */
export type UsePivotResult<TId extends string = string> = {
  /** Current active item ID */
  activeId: TId;
  /** Function to change the active item */
  setActiveId: (id: TId) => void;
  /** Helper to check if an item is active */
  isActive: (id: TId) => boolean;
  /** Function to get props for navigation items (buttons, links, etc.) */
  getItemProps: (id: TId) => PivotItemProps;
  /** Outlet component that renders the active content (react-router style) */
  Outlet: React.FC;
};
