/**
 * @file Helpers for managing resizable grid tracks.
 */
import type { GridTrack } from "./types";
import { createTrackKey, type TrackDirection } from "./trackTemplates";

export const applyConstraints = (size: number, minSize?: number, maxSize?: number): number => {
  const withMinConstraint = minSize !== undefined ? Math.max(size, minSize) : size;
  const withMaxConstraint = maxSize !== undefined ? Math.min(withMinConstraint, maxSize) : withMinConstraint;
  return withMaxConstraint;
};

export const calculateNewTrackSize = (currentSize: number, delta: number, track: GridTrack): number => {
  const newSize = currentSize + delta;
  return applyConstraints(newSize, track.minSize, track.maxSize);
};

export const createTrackSizeUpdater = (
  direction: TrackDirection,
  index: number,
  currentSize: number,
  delta: number,
  track: GridTrack,
) => {
  const key = createTrackKey(direction, index);
  return (prev: Record<string, number>): Record<string, number> => {
    const newSize = calculateNewTrackSize(currentSize, delta, track);
    return { ...prev, [key]: newSize };
  };
};
