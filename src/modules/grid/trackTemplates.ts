/**
 * @file Utilities for managing grid track configuration and sizing.
 */
import type { GridTrack } from "../../panel-system/types";

export type TrackDirection = "row" | "col";

export const createTrackKey = (direction: TrackDirection, index: number): string => {
  return `${direction}-${index}`;
};

const getTrackSize = (
  track: GridTrack,
  trackSizes: Record<string, number>,
  direction: TrackDirection,
  index: number,
): string => {
  const key = createTrackKey(direction, index);
  const currentSize = trackSizes[key];

  if (currentSize !== undefined) {
    return `${currentSize}px`;
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

export const extractInitialTrackSizes = (tracks: GridTrack[], direction: TrackDirection): Record<string, number> => {
  return tracks.reduce<Record<string, number>>((acc, track, index) => {
    if (track.resizable && track.size.endsWith("px")) {
      acc[createTrackKey(direction, index)] = parseInt(track.size, 10);
    }
    return acc;
  }, {});
};
