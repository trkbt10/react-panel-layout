/**
 * @file Platform-specific swipe gesture presets.
 *
 * Provides pre-configured threshold values for different platforms
 * to match their native gesture behaviors.
 */
import type { SwipeInputThresholds } from "./types.js";

/**
 * Platform-specific swipe gesture presets.
 *
 * - ios: Matches iOS native swipe behavior (responsive, smooth)
 * - android: Matches Android gesture behavior (slightly more tolerant)
 * - desktop: For mouse-based interactions (larger thresholds)
 * - relaxed: For contexts where accidental swipes should be avoided
 */
export const SWIPE_PRESETS: Record<string, SwipeInputThresholds> = {
  /**
   * iOS preset: Responsive swipe matching native behavior.
   * Apple devices have precise touch sensors and expect quick response.
   */
  ios: {
    distanceThreshold: 50,
    velocityThreshold: 0.3,
    lockThreshold: 10,
  },

  /**
   * Android preset: Slightly more tolerant thresholds.
   * Accounts for diverse device hardware and touch sensor quality.
   */
  android: {
    distanceThreshold: 60,
    velocityThreshold: 0.25,
    lockThreshold: 12,
  },

  /**
   * Desktop preset: Larger thresholds for mouse-based interactions.
   * Mouse movements are less precise for swipe gestures.
   */
  desktop: {
    distanceThreshold: 80,
    velocityThreshold: 0.4,
    lockThreshold: 15,
  },

  /**
   * Relaxed preset: Higher thresholds to avoid accidental swipes.
   * Use in contexts where unintentional navigation would be disruptive.
   */
  relaxed: {
    distanceThreshold: 100,
    velocityThreshold: 0.5,
    lockThreshold: 20,
  },
} as const;

/**
 * Detect platform from user agent string and return appropriate preset.
 *
 * @param userAgent - Navigator userAgent string
 * @returns Appropriate SwipeInputThresholds for the detected platform
 *
 * @example
 * ```ts
 * const thresholds = getSwipePreset(navigator.userAgent);
 * const { state, containerProps } = useSwipeInput({
 *   containerRef,
 *   axis: "horizontal",
 *   thresholds,
 * });
 * ```
 */
export function getSwipePreset(userAgent: string): SwipeInputThresholds {
  const ua = userAgent.toLowerCase();

  // iOS detection (iPhone, iPad, iPod)
  if (/iphone|ipad|ipod/.test(ua)) {
    return SWIPE_PRESETS.ios;
  }

  // Android detection
  if (/android/.test(ua)) {
    return SWIPE_PRESETS.android;
  }

  // Desktop fallback (Windows, Mac, Linux without touch indicators)
  if (/windows|macintosh|linux/.test(ua) && !/android|mobile/.test(ua)) {
    return SWIPE_PRESETS.desktop;
  }

  // Default to iOS preset for unknown platforms
  return SWIPE_PRESETS.ios;
}
