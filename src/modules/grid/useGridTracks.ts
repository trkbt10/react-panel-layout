/**
 * @file Track sizing and resize handle hooks for the grid layout.
 */
import * as React from "react";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import type { GridTrack, PanelLayoutConfig } from "../../panels";
import { createTrackSizeUpdater } from "./resizeUtils";
import {
  buildTrackTemplateString,
  createTrackKey,
  extractInitialTrackSizes,
  type TrackDirection,
} from "./trackTemplates";

export type TrackHandleConfig = {
  trackIndex: number;
  align: "start" | "end";
};

type ParsedGap = {
  rowGap: number;
  columnGap: number;
};

const computeTrackResizeHandles = (tracks: GridTrack[]): TrackHandleConfig[] => {
  if (tracks.length === 0) {
    return [];
  }

  if (tracks.length === 1) {
    const onlyTrack = tracks[0];
    return onlyTrack?.resizable ? [{ trackIndex: 0, align: "end" }] : [];
  }

  const handles: TrackHandleConfig[] = [];

  const boundaryIndexes = Array.from({ length: tracks.length - 1 }, (_, index) => index);
  boundaryIndexes.forEach((boundaryIndex) => {
    const leftTrack = tracks[boundaryIndex];
    const rightTrack = tracks[boundaryIndex + 1];

    if (rightTrack?.resizable) {
      handles.push({ trackIndex: boundaryIndex + 1, align: "start" });
      return;
    }

    if (leftTrack?.resizable) {
      handles.push({ trackIndex: boundaryIndex, align: "end" });
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

const resolveCurrentTrackSize = (
  trackSizes: Record<string, number>,
  track: GridTrack,
  direction: TrackDirection,
  trackIndex: number,
): number => {
  const key = createTrackKey(direction, trackIndex);
  const storedSize = trackSizes[key];

  if (storedSize !== undefined) {
    return storedSize;
  }

  if (track.size.endsWith("px")) {
    return Number.parseInt(track.size, 10);
  }

  return 300;
};

export const useGridTracks = (
  config: PanelLayoutConfig,
  styleProp?: React.CSSProperties,
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
    const nextSizes = {
      ...extractInitialTrackSizes(config.columns, "col"),
      ...extractInitialTrackSizes(config.rows, "row"),
    };

    setTrackSizes((prev) => {
      const allKeys = new Set([...Object.keys(prev), ...Object.keys(nextSizes)]);
      const hasChanges = Array.from(allKeys).some((key) => {
        return prev[key] !== nextSizes[key];
      });

      return hasChanges ? nextSizes : prev;
    });
  }, [config.columns, config.rows]);

  const areasString = React.useMemo(() => {
    return config.areas.map((row) => `"${row.join(" ")}"`).join(" ");
  }, [config.areas]);

  const gapSizes = React.useMemo(() => parseGap(config.gap), [config.gap]);
  const columnHandles = React.useMemo(() => computeTrackResizeHandles(config.columns), [config.columns]);
  const rowHandles = React.useMemo(() => computeTrackResizeHandles(config.rows), [config.rows]);

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

      const currentSize = resolveCurrentTrackSize(trackSizes, track, direction, trackIndex);
      setTrackSizes(createTrackSizeUpdater(direction, trackIndex, currentSize, delta, track));
    },
    [config.columns, config.rows, trackSizes],
  );

  return {
    columnHandles,
    rowHandles,
    gapSizes,
    gridStyle,
    handleResize,
  };
};

