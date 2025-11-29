/**
 * @file Type definitions for the StickyHeader component.
 *
 * StickyHeader provides a native app-like experience for SPAs/PWAs
 * by displaying cover content during overscroll/bounce.
 */
import type * as React from "react";

/**
 * State information exposed by StickyHeader.
 */
export type StickyHeaderState = {
  /**
   * Whether the header is stuck at the top of the scroll container.
   * True when the header has scrolled to (or past) the top edge.
   */
  isStuck: boolean;
  /**
   * The current scroll offset relative to the header.
   * - Positive: Header has scrolled up past the viewport
   * - Zero: Header is at the top
   * - Negative: Overscroll/bounce (pulling down beyond top)
   */
  scrollOffset: number;
  /**
   * The detected scroll container type.
   * - "document": Using window/document scroll
   * - "container": Using a nested overflow:scroll/auto element
   */
  containerType: "document" | "container";
};

/**
 * Props for the StickyHeader component.
 */
export type StickyHeaderProps = {
  /**
   * Cover content displayed behind the header.
   * This content expands during overscroll/bounce to create
   * a native app-like pull effect.
   */
  cover: React.ReactNode;
  /**
   * Main header content that scrolls over the cover.
   * Can be a ReactNode or a render function receiving state.
   */
  children: React.ReactNode | ((state: StickyHeaderState) => React.ReactNode);
  /**
   * Callback fired when sticky state changes.
   */
  onStateChange?: (state: StickyHeaderState) => void;
};
