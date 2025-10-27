/**
 * @file Dialog positioning utilities
 */

export type ViewportInfo = {
  width: number;
  height: number;
};

/**
 * Get viewport dimensions
 */
export const getViewportInfo = (): ViewportInfo => {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * Calculate context menu position to keep it within viewport
 */
export const calculateContextMenuPosition = (
  anchorX: number,
  anchorY: number,
  menuWidth: number,
  menuHeight: number,
  viewport: ViewportInfo,
): { x: number; y: number } => {
  // Adjust horizontal position if menu would overflow
  const x =
    anchorX + menuWidth > viewport.width ? Math.max(0, viewport.width - menuWidth) : anchorX;

  // Adjust vertical position if menu would overflow
  const y =
    anchorY + menuHeight > viewport.height ? Math.max(0, viewport.height - menuHeight) : anchorY;

  return { x, y };
};
