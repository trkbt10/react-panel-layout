/**
 * @file Type definitions for the StickyArea component.
 *
 * StickyArea provides a native app-like experience for SPAs/PWAs
 * by displaying cover content during overscroll/bounce.
 * Supports both top (header) and bottom (footer) positions.
 * Works with document-level scroll only.
 */
import type * as React from "react";

/**
 * Position of the sticky area.
 * - "top": Header behavior - sticks to top, expands on pull-down overscroll
 * - "bottom": Footer behavior - sticks to bottom, expands on pull-up overscroll
 */
export type StickyAreaPosition = "top" | "bottom";

/**
 * State information exposed by StickyArea.
 */
export type StickyAreaState = {
  /**
   * Whether the area is stuck at its edge of the viewport.
   * - For "top": True when scrolled past the top edge
   * - For "bottom": True when scrolled past the bottom edge
   */
  isStuck: boolean;
  /**
   * The current scroll offset relative to the area.
   * Positive when the area has scrolled past its edge.
   */
  scrollOffset: number;
};

/**
 * Props for the StickyArea component.
 */
export type StickyAreaProps = {
  /**
   * Position of the sticky area.
   * - "top": Header behavior (default)
   * - "bottom": Footer behavior
   *
   * @default "top"
   */
  position?: StickyAreaPosition;
  /**
   * Cover content displayed behind the area.
   * This content expands during overscroll/bounce to create
   * a native app-like pull effect.
   */
  cover: React.ReactNode;
  /**
   * Main content that scrolls over the cover.
   * Can be a ReactNode or a render function receiving state.
   */
  children: React.ReactNode | ((state: StickyAreaState) => React.ReactNode);
  /**
   * Callback fired when sticky state changes.
   */
  onStateChange?: (state: StickyAreaState) => void;
};

// Backwards compatibility aliases
/** @deprecated Use StickyAreaState instead */
export type StickyHeaderState = StickyAreaState;
/** @deprecated Use StickyAreaProps instead */
export type StickyHeaderProps = StickyAreaProps;
