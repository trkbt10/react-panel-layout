/**
 * @file SwipeSafeZone component
 *
 * A wrapper component that marks an area as exempt from swipe gesture detection.
 * Content inside this zone will not trigger swipe-to-close or other swipe gestures.
 *
 * Use this for:
 * - Scrollable content areas
 * - Input fields and text areas
 * - Interactive elements that need drag/swipe for their own purposes
 */
import * as React from "react";

/**
 * Data attribute used to identify swipe-safe zones.
 * Swipe gesture handlers should check for this attribute on target elements.
 */
export const SWIPE_SAFE_ZONE_ATTR = "data-swipe-safe-zone";

export type SwipeSafeZoneProps = {
  /** Content to render inside the safe zone */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
};

/**
 * SwipeSafeZone marks an area where swipe gestures should not be triggered.
 *
 * @example
 * ```tsx
 * <SwipeSafeZone>
 *   <ScrollableList items={items} />
 * </SwipeSafeZone>
 * ```
 */
export const SwipeSafeZone: React.FC<SwipeSafeZoneProps> = ({
  children,
  className,
  style,
}) => {
  return (
    <div
      className={className}
      style={style}
      data-swipe-safe-zone="true"
    >
      {children}
    </div>
  );
};

/**
 * Check if an element is inside a SwipeSafeZone.
 */
export function isInSwipeSafeZone(element: HTMLElement, container: HTMLElement): boolean {
  let current: HTMLElement | null = element;

  while (current && current !== container) {
    if (current.hasAttribute(SWIPE_SAFE_ZONE_ATTR)) {
      return true;
    }
    current = current.parentElement;
  }

  return false;
}
