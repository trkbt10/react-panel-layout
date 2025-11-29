/**
 * @file Grid track sizing utilities.
 */
import type * as React from "react";
import type { GridTrack } from "../../types";
import { clampNumber } from "../../utils/math";
import { measureGridTrackSizes, type GridDirection, type ParsedGap } from "../../utils/css";

export type TrackDirection = GridDirection;

export const createTrackKey = (direction: TrackDirection, index: number): string => {
  return `${direction}-${index}`;
};

export const getTrackSize = (
  track: GridTrack,
  trackSizes: Record<string, number>,
  direction: TrackDirection,
  index: number,
): string => {
  const key = createTrackKey(direction, index);
  const currentSize = trackSizes[key];
  if (currentSize !== undefined) {
    // Use minmax() to ensure the track can shrink if container is smaller
    // This prevents overflow when container width is less than the resized size
    const minSize = track.minSize ?? 0;
    return `minmax(${minSize}px, ${currentSize}px)`;
  }
  return track.size;
};

export const buildTrackTemplateString = (
  tracks: GridTrack[],
  trackSizes: Record<string, number>,
  direction: TrackDirection,
): string => {
  return tracks.map((track, index) => getTrackSize(track, trackSizes, direction, index)).join(" ");
};

export const extractInitialTrackSizes = (
  tracks: GridTrack[],
  direction: TrackDirection,
): Record<string, number> => {
  return tracks.reduce<Record<string, number>>((acc, track, index) => {
    if (track.resizable && track.size.endsWith("px")) {
      acc[createTrackKey(direction, index)] = parseInt(track.size, 10);
    }
    return acc;
  }, {});
};

export type ResolveTrackSizeParams = {
  trackSizes: Record<string, number>;
  track: GridTrack;
  direction: TrackDirection;
  trackIndex: number;
  containerRef: React.RefObject<HTMLElement | null> | undefined;
};

export const resolveCurrentTrackSize = ({
  trackSizes,
  track,
  direction,
  trackIndex,
  containerRef,
}: ResolveTrackSizeParams): number => {
  const key = createTrackKey(direction, trackIndex);
  const storedSize = trackSizes[key];

  if (storedSize !== undefined) {
    return storedSize;
  }

  // Try to measure actual rendered size from DOM
  const measuredSizes = measureGridTrackSizes(containerRef?.current ?? null, direction);
  const measuredSize = measuredSizes[trackIndex];
  if (measuredSize !== undefined && measuredSize > 0) {
    return measuredSize;
  }

  // Fallback: parse simple px value from track definition
  if (track.size.endsWith("px")) {
    return Number.parseInt(track.size, 10);
  }

  return 300;
};

const calculateOtherTracksMinSpace = (tracks: GridTrack[], excludeIndex: number): number => {
  return tracks.reduce((sum, t, idx) => {
    if (idx === excludeIndex) {
      return sum;
    }
    // For fr tracks, assume minimum of 100px; for fixed tracks, use their minSize or parsed size
    if (t.size.includes("fr")) {
      return sum + 100;
    }
    return sum + (t.minSize ?? 50);
  }, 0);
};

export type EffectiveMaxSizeParams = {
  track: GridTrack;
  tracks: GridTrack[];
  trackIndex: number;
  direction: TrackDirection;
  containerRef: React.RefObject<HTMLElement | null> | undefined;
  gapSizes: ParsedGap;
};

export const calculateEffectiveMaxSize = ({
  track,
  tracks,
  trackIndex,
  direction,
  containerRef,
  gapSizes,
}: EffectiveMaxSizeParams): number | undefined => {
  if (!containerRef?.current) {
    return track.maxSize;
  }

  const containerSize =
    direction === "col" ? containerRef.current.offsetWidth : containerRef.current.offsetHeight;

  const otherTracksMinSpace = calculateOtherTracksMinSpace(tracks, trackIndex);

  const gapCount = tracks.length - 1;
  const gapSize = direction === "col" ? gapSizes.columnGap : gapSizes.rowGap;
  const totalGapSpace = gapCount * gapSize;

  const dynamicMax = containerSize - otherTracksMinSpace - totalGapSpace;

  if (track.maxSize !== undefined) {
    return Math.min(track.maxSize, dynamicMax);
  }
  return dynamicMax;
};

export const applyTrackConstraints = (
  size: number,
  minSize?: number,
  maxSize?: number,
): number => {
  return clampNumber(size, minSize ?? Number.NEGATIVE_INFINITY, maxSize ?? Number.POSITIVE_INFINITY);
};
