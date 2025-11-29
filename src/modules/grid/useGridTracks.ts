/**
 * @file Track sizing and resize handle hooks for the grid layout.
 */
import * as React from "react";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import type { GridTrack, PanelLayoutConfig } from "../../types";

export type TrackHandleConfig = {
  trackIndex: number;
  align: "start" | "end";
  span: { start: number; end: number };
};

type ParsedGap = {
  rowGap: number;
  columnGap: number;
};

// Inline track template utilities (previously in helpers)
type TrackDirection = "row" | "col";

const createTrackKey = (direction: TrackDirection, index: number): string => {
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
    // Use minmax() to ensure the track can shrink if container is smaller
    // This prevents overflow when container width is less than the resized size
    const minSize = track.minSize ?? 0;
    return `minmax(${minSize}px, ${currentSize}px)`;
  }
  return track.size;
};

const buildTrackTemplateString = (
  tracks: GridTrack[],
  trackSizes: Record<string, number>,
  direction: TrackDirection,
): string => {
  return tracks.map((track, index) => getTrackSize(track, trackSizes, direction, index)).join(" ");
};

const extractInitialTrackSizes = (tracks: GridTrack[], direction: TrackDirection): Record<string, number> => {
  return tracks.reduce<Record<string, number>>((acc, track, index) => {
    if (track.resizable && track.size.endsWith("px")) {
      acc[createTrackKey(direction, index)] = parseInt(track.size, 10);
    }
    return acc;
  }, {});
};

// Inline resize utils
const applyConstraints = (size: number, minSize?: number, maxSize?: number): number => {
  const withMinConstraint = minSize !== undefined ? Math.max(size, minSize) : size;
  const withMaxConstraint = maxSize !== undefined ? Math.min(withMinConstraint, maxSize) : withMinConstraint;
  return withMaxConstraint;
};

/**
 * Measures actual rendered track sizes from computed style.
 * Returns pixel values parsed from gridTemplateColumns or gridTemplateRows.
 */
const measureRenderedTrackSizes = (
  containerEl: HTMLElement | null,
  direction: TrackDirection,
): number[] => {
  if (!containerEl) {
    return [];
  }
  const style = getComputedStyle(containerEl);
  const template = direction === "col" ? style.gridTemplateColumns : style.gridTemplateRows;

  // Computed style returns resolved pixel values like "370px 500px"
  return template
    .split(/\s+/)
    .map((s) => parseFloat(s))
    .filter((n) => !Number.isNaN(n));
};

/**
 * Computes the valid row span for a column boundary.
 * Returns the contiguous range of rows where the adjacent areas differ.
 */
const computeColumnBoundarySpan = (
  areas: string[][],
  boundaryIndex: number,
): { start: number; end: number } => {
  const rowCount = areas.length;

  // Find rows where left and right areas differ at this boundary
  const validRows: number[] = [];
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = areas[rowIndex];
    const leftArea = row[boundaryIndex];
    const rightArea = row[boundaryIndex + 1];
    if (leftArea !== rightArea) {
      validRows.push(rowIndex);
    }
  }

  if (validRows.length === 0) {
    // Fallback: full span if no valid rows found (shouldn't happen for resizable columns)
    return { start: 1, end: rowCount + 1 };
  }

  // Convert to 1-indexed grid lines
  const minRow = Math.min(...validRows);
  const maxRow = Math.max(...validRows);
  return { start: minRow + 1, end: maxRow + 2 };
};

/**
 * Computes the valid column span for a row boundary.
 * Returns the contiguous range of columns where the adjacent areas differ.
 */
const computeRowBoundarySpan = (
  areas: string[][],
  boundaryIndex: number,
): { start: number; end: number } => {
  const topRow = areas[boundaryIndex];
  const bottomRow = areas[boundaryIndex + 1];
  const colCount = topRow?.length ?? 0;

  // Find columns where top and bottom areas differ at this boundary
  const validCols: number[] = [];
  for (let colIndex = 0; colIndex < colCount; colIndex++) {
    const topArea = topRow?.[colIndex];
    const bottomArea = bottomRow?.[colIndex];
    if (topArea !== bottomArea) {
      validCols.push(colIndex);
    }
  }

  if (validCols.length === 0) {
    // Fallback: full span if no valid columns found
    return { start: 1, end: colCount + 1 };
  }

  // Convert to 1-indexed grid lines
  const minCol = Math.min(...validCols);
  const maxCol = Math.max(...validCols);
  return { start: minCol + 1, end: maxCol + 2 };
};

const computeColumnResizeHandles = (
  tracks: GridTrack[],
  areas: string[][],
): TrackHandleConfig[] => {
  if (tracks.length === 0) {
    return [];
  }

  const rowCount = areas.length;

  if (tracks.length === 1) {
    const onlyTrack = tracks[0];
    if (onlyTrack?.resizable) {
      const fullSpan = { start: 1, end: rowCount + 1 };
      return [{ trackIndex: 0, align: "end", span: fullSpan }];
    }
    return [];
  }

  const handles: TrackHandleConfig[] = [];

  const boundaryIndexes = Array.from({ length: tracks.length - 1 }, (_, index) => index);
  boundaryIndexes.forEach((boundaryIndex) => {
    const leftTrack = tracks[boundaryIndex];
    const rightTrack = tracks[boundaryIndex + 1];

    if (rightTrack?.resizable) {
      const span = computeColumnBoundarySpan(areas, boundaryIndex);
      handles.push({ trackIndex: boundaryIndex + 1, align: "start", span });
      return;
    }

    if (leftTrack?.resizable) {
      const span = computeColumnBoundarySpan(areas, boundaryIndex);
      handles.push({ trackIndex: boundaryIndex, align: "end", span });
    }
  });

  return handles;
};

const computeRowResizeHandles = (
  tracks: GridTrack[],
  areas: string[][],
): TrackHandleConfig[] => {
  if (tracks.length === 0) {
    return [];
  }

  const colCount = areas[0]?.length ?? 0;

  if (tracks.length === 1) {
    const onlyTrack = tracks[0];
    if (onlyTrack?.resizable) {
      const fullSpan = { start: 1, end: colCount + 1 };
      return [{ trackIndex: 0, align: "end", span: fullSpan }];
    }
    return [];
  }

  const handles: TrackHandleConfig[] = [];

  const boundaryIndexes = Array.from({ length: tracks.length - 1 }, (_, index) => index);
  boundaryIndexes.forEach((boundaryIndex) => {
    const topTrack = tracks[boundaryIndex];
    const bottomTrack = tracks[boundaryIndex + 1];

    if (bottomTrack?.resizable) {
      const span = computeRowBoundarySpan(areas, boundaryIndex);
      handles.push({ trackIndex: boundaryIndex + 1, align: "start", span });
      return;
    }

    if (topTrack?.resizable) {
      const span = computeRowBoundarySpan(areas, boundaryIndex);
      handles.push({ trackIndex: boundaryIndex, align: "end", span });
    }
  });

  return handles;
};

const parseGap = (gapValue?: string): ParsedGap => {
  if (!gapValue) {
    return { rowGap: 0, columnGap: 0 };
  }

  const tokens = gapValue
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const parseToken = (token: string): number => {
    const match = token.match(/^(-?\d+(?:\.\d+)?)px$/);
    if (!match) {
      return 0;
    }
    return Number.parseFloat(match[1]);
  };

  if (tokens.length === 1) {
    const parsed = parseToken(tokens[0]);
    return { rowGap: parsed, columnGap: parsed };
  }

  return {
    rowGap: parseToken(tokens[0]),
    columnGap: parseToken(tokens[1]),
  };
};

const getGapStyle = (gap?: string): React.CSSProperties => {
  return gap !== undefined ? { gap } : {};
};

type ResolveTrackSizeParams = {
  trackSizes: Record<string, number>;
  track: GridTrack;
  direction: TrackDirection;
  trackIndex: number;
  containerRef: React.RefObject<HTMLElement | null> | undefined;
};

const resolveCurrentTrackSize = ({
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
  const measuredSizes = measureRenderedTrackSizes(containerRef?.current ?? null, direction);
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

type EffectiveMaxSizeParams = {
  track: GridTrack;
  tracks: GridTrack[];
  trackIndex: number;
  direction: TrackDirection;
  containerRef: React.RefObject<HTMLElement | null> | undefined;
  gapSizes: ParsedGap;
};

const calculateEffectiveMaxSize = ({
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
      // Only consider tracks that exist in the current config
      const nextKeys = Object.keys(initialSizes);

      // Preserve existing values; use initial values only for new tracks
      const merged: Record<string, number> = {};
      for (const key of nextKeys) {
        merged[key] = prev[key] ?? initialSizes[key];
      }

      // Check if there are any changes
      const prevKeys = Object.keys(prev);
      const keysChangedByLength = prevKeys.length !== nextKeys.length;
      const keysChangedByMissing = prevKeys.some((key) => !Object.prototype.hasOwnProperty.call(merged, key));
      const keysChanged = keysChangedByLength ? true : keysChangedByMissing;
      const valuesChanged = nextKeys.some((key) => prev[key] !== merged[key]);

      const hasChanges = keysChanged ? true : valuesChanged;
      return hasChanges ? merged : prev;
    });
  }, [config.columns, config.rows]);

  const areasString = React.useMemo(() => {
    return config.areas.map((row) => `"${row.join(" ")}"`).join(" ");
  }, [config.areas]);

  const gapSizes = React.useMemo(() => parseGap(config.gap), [config.gap]);
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
        const constrained = applyConstraints(newSize, track.minSize, effectiveMaxSize);
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
