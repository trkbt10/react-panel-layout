/**
 * @file Drawer style computation utilities.
 *
 * Provides pure functions for computing drawer styles based on configuration.
 */
import type * as React from "react";
import type { DrawerBehavior } from "../../types.js";
import {
  COLOR_DRAWER_BACKDROP,
  DRAWER_TRANSITION_DURATION,
  DRAWER_TRANSITION_EASING,
} from "../../constants/styles.js";

/**
 * Base backdrop style shared by backdrop and edge zone.
 */
export const DRAWER_BACKDROP_BASE_STYLE: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: COLOR_DRAWER_BACKDROP,
};

/**
 * Base drawer panel style.
 */
export const DRAWER_PANEL_BASE_STYLE: React.CSSProperties = {
  willChange: "transform",
};

/**
 * Placement-specific styles for drawer positioning.
 */
export type DrawerPlacement = "left" | "right" | "top" | "bottom";

const PLACEMENT_STYLES: Record<DrawerPlacement, React.CSSProperties> = {
  left: {
    top: 0,
    bottom: 0,
    left: 0,
    transform: "translateX(-100%)",
  },
  right: {
    top: 0,
    bottom: 0,
    right: 0,
    transform: "translateX(100%)",
  },
  top: {
    top: 0,
    left: 0,
    right: 0,
    transform: "translateY(-100%)",
  },
  bottom: {
    bottom: 0,
    left: 0,
    right: 0,
    transform: "translateY(100%)",
  },
};

const OPEN_TRANSFORMS: Record<DrawerPlacement, string> = {
  left: "translateX(0)",
  right: "translateX(0)",
  top: "translateY(0)",
  bottom: "translateY(0)",
};

/**
 * Get placement-specific style.
 */
export function getPlacementStyle(placement: DrawerPlacement): React.CSSProperties {
  return PLACEMENT_STYLES[placement];
}

/**
 * Get transform value for open state.
 */
export function getOpenTransform(placement: DrawerPlacement): string {
  return OPEN_TRANSFORMS[placement];
}

/**
 * Get closed transform value.
 */
export function getClosedTransform(placement: DrawerPlacement): string {
  return PLACEMENT_STYLES[placement].transform as string;
}

/**
 * Compute CSS transition value.
 */
export function computeTransitionValue(
  mode: DrawerBehavior["transitionMode"] | undefined,
  duration: DrawerBehavior["transitionDuration"],
  easing: DrawerBehavior["transitionEasing"],
): string | undefined {
  if (mode === "none") {
    return undefined;
  }

  const durationValue = duration ?? DRAWER_TRANSITION_DURATION;
  const easingValue = easing ?? DRAWER_TRANSITION_EASING;

  return `transform ${durationValue} ${easingValue}`;
}

/**
 * Compute backdrop transition value.
 */
export function computeBackdropTransition(
  mode: DrawerBehavior["transitionMode"] | undefined,
  duration: DrawerBehavior["transitionDuration"],
): string | undefined {
  if (mode === "none") {
    return undefined;
  }
  return `opacity ${duration ?? "220ms"} ease`;
}

/**
 * Check if placement is horizontal (left/right).
 */
export function isHorizontalPlacement(placement: DrawerPlacement): boolean {
  return placement === "left" || placement === "right";
}

/**
 * Format dimension value to CSS string.
 */
export function formatDimension(value: string | number | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "number") {
    return `${value}px`;
  }
  return value;
}

// ============================================================================
// Edge Zone Styles
// ============================================================================

/**
 * Options for computing edge zone style.
 */
export type EdgeZoneStyleOptions = {
  placement: DrawerPlacement;
  inline: boolean;
  edgeWidth: number;
  zIndex: number | undefined;
};

/**
 * Compute edge zone style based on placement and positioning context.
 *
 * The edge zone is positioned at the edge where the drawer appears from:
 * - left drawer: left edge of the container
 * - right drawer: right edge of the container
 * - top drawer: top edge of the container
 * - bottom drawer: bottom edge of the container
 *
 * When inline=true, uses absolute positioning (relative to parent container).
 * When inline=false, uses fixed positioning (relative to viewport).
 */
export function computeEdgeZoneStyle(options: EdgeZoneStyleOptions): React.CSSProperties {
  const { placement, inline, edgeWidth, zIndex } = options;
  const position = inline ? "absolute" : "fixed";
  const computedZIndex = zIndex !== undefined ? zIndex - 2 : 1000;

  return getEdgeZoneStyleByPlacement(placement, position, edgeWidth, computedZIndex);
}

function getEdgeZoneStyleByPlacement(
  placement: DrawerPlacement,
  position: "absolute" | "fixed",
  edgeWidth: number,
  zIndex: number,
): React.CSSProperties {
  // Common base style
  const base: React.CSSProperties = {
    position,
    zIndex,
    background: "transparent",
    pointerEvents: "auto",
  };

  // Placement-specific positioning
  if (placement === "left") {
    return {
      ...base,
      top: 0,
      bottom: 0,
      left: 0,
      width: edgeWidth,
    };
  }

  if (placement === "right") {
    return {
      ...base,
      top: 0,
      bottom: 0,
      right: 0,
      width: edgeWidth,
    };
  }

  if (placement === "top") {
    return {
      ...base,
      top: 0,
      left: 0,
      right: 0,
      height: edgeWidth,
    };
  }

  // bottom
  return {
    ...base,
    bottom: 0,
    left: 0,
    right: 0,
    height: edgeWidth,
  };
}
