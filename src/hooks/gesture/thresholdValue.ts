/**
 * @file ThresholdValue type and parsing utilities.
 *
 * Provides a flexible way to specify threshold values in either:
 * - Absolute pixels: { value: 50, unit: "px" } or "50px"
 * - Ratio of container: { value: 0.25, unit: "ratio" } or "25%"
 */

/**
 * Parsed threshold value with explicit unit.
 */
export type ParsedThresholdValue = {
  value: number;
  unit: "px" | "ratio";
};

/**
 * Threshold value input format.
 * Accepts either an object with explicit unit or a string shorthand.
 *
 * @example
 * // Object format
 * { value: 50, unit: "px" }
 * { value: 0.25, unit: "ratio" }
 *
 * // String shorthand
 * "50px"   // 50 pixels
 * "25%"    // 25% of container (ratio 0.25)
 */
export type ThresholdValue = ParsedThresholdValue | string;

/**
 * Parse a ThresholdValue input into a normalized ParsedThresholdValue.
 *
 * @param input - The threshold value to parse
 * @returns Normalized threshold value object
 * @throws Error if string format is invalid
 */
export function parseThresholdValue(input: ThresholdValue): ParsedThresholdValue {
  if (typeof input === "object") {
    return input;
  }

  const trimmed = input.trim();

  // Match "50px" or "50 px"
  const pxMatch = trimmed.match(/^([\d.]+)\s*px$/i);
  if (pxMatch) {
    return { value: parseFloat(pxMatch[1]), unit: "px" };
  }

  // Match "25%" or "25 %"
  const percentMatch = trimmed.match(/^([\d.]+)\s*%$/);
  if (percentMatch) {
    const percentage = parseFloat(percentMatch[1]);
    return { value: percentage / 100, unit: "ratio" };
  }

  throw new Error(`Invalid threshold format: "${input}". Expected "50px" or "25%"`);
}

/**
 * Resolve a threshold value to pixels given a container size.
 *
 * @param input - The threshold value (object or string)
 * @param containerSize - The container size in pixels for ratio calculation
 * @returns The threshold in pixels
 */
export function resolveThreshold(input: ThresholdValue, containerSize: number): number {
  const parsed = parseThresholdValue(input);

  if (parsed.unit === "px") {
    return parsed.value;
  }

  return parsed.value * containerSize;
}
