/**
 * @file Drawer swipe gesture configuration parsing.
 *
 * Normalizes swipeGestures config from DrawerBehavior into a consistent shape.
 */
import type { DrawerBehavior, WindowPosition } from "../../types.js";
import type { DrawerPlacement } from "./drawerStyles.js";

/**
 * Normalized swipe gesture configuration.
 */
export type NormalizedSwipeConfig = {
  enabled: boolean;
  edgeSwipeOpen: boolean;
  swipeClose: boolean;
  edgeWidth: number;
  dismissThreshold: number;
};

const DEFAULT_EDGE_WIDTH = 20;
const DEFAULT_DISMISS_THRESHOLD = 0.3;

const DISABLED_CONFIG: NormalizedSwipeConfig = {
  enabled: false,
  edgeSwipeOpen: false,
  swipeClose: false,
  edgeWidth: DEFAULT_EDGE_WIDTH,
  dismissThreshold: DEFAULT_DISMISS_THRESHOLD,
};

const ENABLED_DEFAULT_CONFIG: NormalizedSwipeConfig = {
  enabled: true,
  edgeSwipeOpen: true,
  swipeClose: true,
  edgeWidth: DEFAULT_EDGE_WIDTH,
  dismissThreshold: DEFAULT_DISMISS_THRESHOLD,
};

/**
 * Parse swipeGestures config into normalized options.
 */
export function parseSwipeGesturesConfig(
  swipeGestures: DrawerBehavior["swipeGestures"],
): NormalizedSwipeConfig {
  if (swipeGestures === true) {
    return ENABLED_DEFAULT_CONFIG;
  }

  if (swipeGestures === false || swipeGestures === undefined) {
    return DISABLED_CONFIG;
  }

  return {
    enabled: true,
    edgeSwipeOpen: swipeGestures.edgeSwipeOpen ?? true,
    swipeClose: swipeGestures.swipeClose ?? true,
    edgeWidth: swipeGestures.edgeWidth ?? DEFAULT_EDGE_WIDTH,
    dismissThreshold: swipeGestures.dismissThreshold ?? DEFAULT_DISMISS_THRESHOLD,
  };
}

/**
 * Resolve drawer placement from anchor and position.
 */
export function resolvePlacement(
  anchor: DrawerBehavior["anchor"],
  position: WindowPosition | undefined,
): DrawerPlacement {
  if (anchor) {
    return anchor;
  }

  if (!position) {
    return "right";
  }

  if (position.left !== undefined) {
    return "left";
  }
  if (position.right !== undefined) {
    return "right";
  }
  if (position.top !== undefined) {
    return "top";
  }
  if (position.bottom !== undefined) {
    return "bottom";
  }

  return "right";
}

/**
 * Determine if edge zone should be visible.
 */
export function shouldShowEdgeZone(
  config: NormalizedSwipeConfig,
  isOpen: boolean,
  isOpening: boolean,
): boolean {
  if (!config.enabled) {
    return false;
  }
  if (!config.edgeSwipeOpen) {
    return false;
  }
  // Show when closed or actively opening
  if (!isOpen) {
    return true;
  }
  return isOpening;
}
