/**
 * @file Resize handle configuration computation for grid tracks.
 */
import type { GridTrack } from "../../types";

export type TrackHandleConfig = {
  trackIndex: number;
  align: "start" | "end";
  span: { start: number; end: number };
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

export const computeColumnResizeHandles = (
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

export const computeRowResizeHandles = (
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
