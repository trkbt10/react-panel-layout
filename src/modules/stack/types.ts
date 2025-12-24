/**
 * @file Type definitions for the Stack navigation component system.
 *
 * Stack manages hierarchical navigation where panels stack as you drill down.
 * Similar to iOS/iPadOS navigation controllers.
 */
import type * as React from "react";

/**
 * Display mode for stack panels.
 * - "overlay": Panels fully overlap (mobile style)
 * - "slide": Panels slide in from edge
 * - "stack": Panels stack with visual depth (tablet style)
 */
export type StackDisplayMode = "overlay" | "slide" | "stack";

/**
 * Transition mode for stack animations.
 * - "css": Uses CSS transitions/animations
 * - "none": No transitions (uses React.Activity for memory optimization)
 */
export type StackTransitionMode = "css" | "none";

/**
 * A panel in the stack.
 */
export type StackPanel<TId extends string = string> = {
  /** Unique identifier for this panel */
  id: TId;
  /** Human-readable title for the panel (used in headers, back buttons) */
  title?: string;
  /** The content to render */
  content: React.ReactNode;
  /**
   * Enable content caching to preserve React component state.
   * When disabled (default), content is re-created on each render.
   * @default false
   */
  cache?: boolean;
};

/**
 * State of the stack navigation.
 */
export type StackNavigationState<TId extends string = string> = {
  /** Stack of panel IDs representing the navigation hierarchy */
  stack: ReadonlyArray<TId>;
  /** Current depth in the stack (0-indexed) */
  depth: number;
  /** Whether a parent panel is being revealed (peeking) */
  isRevealing: boolean;
  /** Depth of the revealed parent, if any */
  revealDepth: number | null;
};

/**
 * Props returned by getPanelProps for panel elements.
 */
export type StackPanelProps = {
  "data-stack-panel": string;
  "data-depth": number;
  "data-active": "true" | "false";
  "aria-hidden": boolean;
};

/**
 * Props returned by getBackButtonProps for back navigation.
 */
export type StackBackButtonProps = {
  onClick: () => void;
  disabled: boolean;
  "aria-label": string;
};

/**
 * Options for useStackNavigation hook.
 */
export type UseStackNavigationOptions<TId extends string = string> = {
  /** Array of available panels */
  panels: ReadonlyArray<StackPanel<TId>>;
  /** Initial panel ID to display. @default first panel */
  initialPanelId?: TId;
  /** Display mode for panels */
  displayMode: StackDisplayMode;
  /** Transition mode for animations. @default "css" */
  transitionMode?: StackTransitionMode;
  /** Callback when panel changes */
  onPanelChange?: (id: TId, depth: number) => void;
};

/**
 * Result from useStackNavigation hook.
 */
export type UseStackNavigationResult<TId extends string = string> = {
  /** Current navigation state */
  state: StackNavigationState<TId>;

  // Navigation operations

  /**
   * Push a new panel onto the stack.
   * @param id - Panel ID to push
   */
  push: (id: TId) => void;

  /**
   * Navigate in a direction relative to current depth.
   * @param direction - Number of steps: -1=back, -2=back2, etc.
   */
  go: (direction: number) => void;

  /**
   * Move to an absolute depth in the stack.
   * @param depth - Target depth (0-indexed)
   */
  move: (depth: number) => void;

  /**
   * Replace the current panel with a new one.
   * @param id - Panel ID to replace with
   */
  replace: (id: TId) => void;

  // Parent reveal operations

  /**
   * Temporarily reveal a parent panel.
   * @param depth - Depth to reveal to (defaults to depth-1)
   */
  revealParent: (depth?: number) => void;

  /**
   * Reveal the root panel.
   */
  revealRoot: () => void;

  /**
   * Dismiss the parent reveal and return to current panel.
   */
  dismissReveal: () => void;

  // Props and state getters

  /**
   * Get props for a panel element.
   * @param id - Panel ID
   */
  getPanelProps: (id: TId) => StackPanelProps;

  /**
   * Get props for a back button.
   */
  getBackButtonProps: () => StackBackButtonProps;

  /**
   * Check if navigation in a direction is possible.
   * @param direction - Direction to check
   */
  canGo: (direction: number) => boolean;

  /** Current panel ID (top of stack) */
  currentPanelId: TId;

  /** Previous panel ID (one step back), or null if at root */
  previousPanelId: TId | null;

  // Rendering

  /** Outlet component that renders the stack content */
  Outlet: React.FC;
};

/**
 * Options for useStackSwipeInput hook.
 */
export type UseStackSwipeInputOptions = {
  /** Reference to the swipe container element */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Stack navigation result from useStackNavigation */
  navigation: Pick<UseStackNavigationResult, "go" | "canGo" | "revealParent" | "dismissReveal" | "state">;
  /** Edge to detect swipes from. @default "left" */
  edge?: "left" | "right";
  /** Width of the edge detection zone. @default 20 */
  edgeWidth?: number;
  /** Whether swipe input is enabled. @default true */
  enabled?: boolean;
};

/**
 * Result from useStackSwipeInput hook.
 */
export type UseStackSwipeInputResult = {
  /** Whether currently swiping from edge */
  isEdgeSwiping: boolean;
  /** Swipe progress (0-1) for animation */
  progress: number;
  /** Props to spread on the container element */
  containerProps: React.HTMLAttributes<HTMLElement> & {
    style: React.CSSProperties;
  };
};

/**
 * Props for StackContent component.
 */
export type StackContentProps = {
  /** Panel ID */
  id: string;
  /** Panel depth in the stack */
  depth: number;
  /** Whether this panel is currently active (top of stack) */
  isActive: boolean;
  /** Display mode */
  displayMode: StackDisplayMode;
  /** Transition mode */
  transitionMode: StackTransitionMode;
  /** Current navigation state */
  navigationState: StackNavigationState;
  /** Swipe progress for animation (0-1) */
  swipeProgress?: number;
  /** Content to render */
  children: React.ReactNode;
};
