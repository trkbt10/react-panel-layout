/**
 * @file Primitive math helpers shared across modules.
 */

export const clampNumber = (
  value: number,
  min: number = Number.NEGATIVE_INFINITY,
  max: number = Number.POSITIVE_INFINITY,
): number => {
  return Math.min(Math.max(value, min), max);
};

export const toFiniteNumberOr = (value: number | undefined, fallback: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return value;
};
