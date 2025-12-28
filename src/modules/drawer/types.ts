/**
 * @file Type definitions for Drawer swipe gesture handling.
 */
import type * as React from "react";
import type { ContinuousOperationState } from "../../hooks/gesture/types.js";

/**
 * Direction for drawer anchor (same as anchor edge).
 */
export type DrawerSwipeDirection = "left" | "right" | "top" | "bottom";

/**
 * Options for useDrawerSwipeInput hook.
 */
export type UseDrawerSwipeInputOptions = {
  /** Container ref for edge detection zone (e.g., GridLayout container) */
  edgeContainerRef: React.RefObject<HTMLElement | null>;
  /** Drawer content ref (for close gesture) */
  drawerContentRef: React.RefObject<HTMLElement | null>;
  /** Drawer direction (anchor edge) */
  direction: DrawerSwipeDirection;
  /** Whether the drawer is currently open */
  isOpen: boolean;
  /** Callback when swipe should open the drawer */
  onSwipeOpen: () => void;
  /** Callback when swipe should close the drawer */
  onSwipeClose: () => void;
  /** Whether edge swipe to open is enabled. @default true */
  enableEdgeSwipeOpen?: boolean;
  /** Whether swipe to close is enabled. @default true */
  enableSwipeClose?: boolean;
  /** Width of edge detection zone in pixels. @default 20 */
  edgeWidth?: number;
  /** Dismiss threshold ratio (0-1). @default 0.3 */
  dismissThreshold?: number;
};

/**
 * Result from useDrawerSwipeInput hook.
 */
export type UseDrawerSwipeInputResult = {
  /** Current operation state */
  state: ContinuousOperationState;
  /** Whether currently opening via edge swipe */
  isOpening: boolean;
  /** Whether currently closing via drag */
  isClosing: boolean;
  /** Progress (0-1) towards open/close threshold */
  progress: number;
  /** Displacement in pixels (primary axis) */
  displacement: number;
  /** Props for edge container (open gesture zone) */
  edgeContainerProps: React.HTMLAttributes<HTMLElement> & {
    style: React.CSSProperties;
  };
  /** Props for drawer content (close gesture zone) */
  drawerContentProps: React.HTMLAttributes<HTMLElement> & {
    style: React.CSSProperties;
  };
};

/**
 * Get animation axis from direction.
 */
export function getDrawerAnimationAxis(direction: DrawerSwipeDirection): "x" | "y" {
  switch (direction) {
    case "left":
    case "right":
      return "x";
    case "top":
    case "bottom":
      return "y";
  }
}

/**
 * Get the sign for the close swipe direction.
 * Left drawer closes by swiping left (-1).
 * Right drawer closes by swiping right (+1).
 * Top drawer closes by swiping up (-1).
 * Bottom drawer closes by swiping down (+1).
 */
export function getDrawerCloseSwipeSign(direction: DrawerSwipeDirection): 1 | -1 {
  switch (direction) {
    case "left":
      return -1;
    case "right":
      return 1;
    case "top":
      return -1;
    case "bottom":
      return 1;
  }
}

/**
 * Get the sign for the open swipe direction.
 * This is the opposite of the close direction.
 */
export function getDrawerOpenSwipeSign(direction: DrawerSwipeDirection): 1 | -1 {
  return (getDrawerCloseSwipeSign(direction) * -1) as 1 | -1;
}
