/**
 * @file Track sizing and resize handle hooks for the grid layout.
 */
import * as React from "react";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import type { PanelLayoutConfig } from "../../types";
import { parseGapValue, type ParsedGap } from "../../utils/css";
import {
  type TrackDirection,
  createTrackKey,
  buildTrackTemplateString,
  extractInitialTrackSizes,
  resolveCurrentTrackSize,
  calculateEffectiveMaxSize,
  applyTrackConstraints,
} from "./trackUtils";
import {
  type TrackHandleConfig,
  computeColumnResizeHandles,
  computeRowResizeHandles,
} from "./resizeHandles";

// Re-export types for external consumers
export type { TrackHandleConfig } from "./resizeHandles";
export type { TrackDirection } from "./trackUtils";

const getGapStyle = (gap?: string): React.CSSProperties => {
  return gap !== undefined ? { gap } : {};
};

/**
 * Merges new track sizes with existing ones, preserving user-resized values.
 * Only applies initial values for newly added tracks.
 */
const mergeTrackSizes = (
  prev: Record<string, number>,
  initialSizes: Record<string, number>,
): Record<string, number> | null => {
  const nextKeys = Object.keys(initialSizes);

  // Preserve existing values; use initial values only for new tracks
  const merged: Record<string, number> = {};
  for (const key of nextKeys) {
    merged[key] = prev[key] ?? initialSizes[key];
  }

  // Check if there are any changes
  const prevKeys = Object.keys(prev);
  const keysChangedByLength = prevKeys.length !== nextKeys.length;
  const keysChangedByMissing = prevKeys.some(
    (key) => !Object.prototype.hasOwnProperty.call(merged, key),
  );
  const keysChanged = keysChangedByLength ? true : keysChangedByMissing;
  const valuesChanged = nextKeys.some((key) => prev[key] !== merged[key]);

  const hasChanges = keysChanged ? true : valuesChanged;
  return hasChanges ? merged : null;
};

export const useGridTracks = (
  config: PanelLayoutConfig,
  styleProp?: React.CSSProperties,
  containerRef?: React.RefObject<HTMLElement | null>,
): {
  columnHandles: TrackHandleConfig[];
  rowHandles: TrackHandleConfig[];
  gapSizes: ParsedGap;
  gridStyle: React.CSSProperties;
  handleResize: (direction: TrackDirection, trackIndex: number, delta: number) => void;
} => {
  const [trackSizes, setTrackSizes] = React.useState<Record<string, number>>(() => ({
    ...extractInitialTrackSizes(config.columns, "col"),
    ...extractInitialTrackSizes(config.rows, "row"),
  }));

  useIsomorphicLayoutEffect(() => {
    const initialSizes = {
      ...extractInitialTrackSizes(config.columns, "col"),
      ...extractInitialTrackSizes(config.rows, "row"),
    };

    setTrackSizes((prev) => {
      const merged = mergeTrackSizes(prev, initialSizes);
      return merged ?? prev;
    });
  }, [config.columns, config.rows]);

  const areasString = React.useMemo(() => {
    return config.areas.map((row) => `"${row.join(" ")}"`).join(" ");
  }, [config.areas]);

  const gapSizes = React.useMemo(() => parseGapValue(config.gap), [config.gap]);

  const columnHandles = React.useMemo(
    () => computeColumnResizeHandles(config.columns, config.areas),
    [config.columns, config.areas],
  );

  const rowHandles = React.useMemo(
    () => computeRowResizeHandles(config.rows, config.areas),
    [config.rows, config.areas],
  );

  const gridStyle = React.useMemo((): React.CSSProperties => {
    return {
      ...config.style,
      ...styleProp,
      gridTemplateAreas: areasString,
      gridTemplateRows: buildTrackTemplateString(config.rows, trackSizes, "row"),
      gridTemplateColumns: buildTrackTemplateString(config.columns, trackSizes, "col"),
      ...getGapStyle(config.gap),
    };
  }, [areasString, config.columns, config.gap, config.rows, config.style, styleProp, trackSizes]);

  const handleResize = React.useCallback(
    (direction: TrackDirection, trackIndex: number, delta: number) => {
      const tracks = direction === "row" ? config.rows : config.columns;
      const track = tracks[trackIndex];
      if (!track || !track.resizable) {
        return;
      }

      const currentSize = resolveCurrentTrackSize({
        trackSizes,
        track,
        direction,
        trackIndex,
        containerRef,
      });
      const effectiveMaxSize = calculateEffectiveMaxSize({
        track,
        tracks,
        trackIndex,
        direction,
        containerRef,
        gapSizes,
      });

      const key = createTrackKey(direction, trackIndex);
      setTrackSizes((prev) => {
        const newSize = currentSize + delta;
        const constrained = applyTrackConstraints(newSize, track.minSize, effectiveMaxSize);
        return { ...prev, [key]: constrained };
      });
    },
    [config.columns, config.rows, trackSizes, containerRef, gapSizes],
  );

  return {
    columnHandles,
    rowHandles,
    gapSizes,
    gridStyle,
    handleResize,
  };
};
