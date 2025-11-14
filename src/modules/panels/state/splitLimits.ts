/**
 * @file Split-limit helpers for the panel system.
 */
import type { GroupId, PanelSplitLimits, PanelTree, SplitDirection } from "./types";
import { splitLeaf, isGroup } from "./tree/logic";
import { clampNumber, toFiniteNumberOr } from "../../../utils/math";

export type NormalizedSplitLimits = {
  rows: number;
  cols: number;
};

const clampLimit = (value: number | undefined): number => {
  const finite = toFiniteNumberOr(value, Number.POSITIVE_INFINITY);
  return clampNumber(finite, 1);
};

const isObjectLimits = (limits: PanelSplitLimits): limits is Record<string, unknown> =>
  typeof limits === "object" && limits !== null;

const isRowsColsLimits = (limits: PanelSplitLimits): limits is { rows?: number; cols?: number } => {
  if (!isObjectLimits(limits)) {
    return false;
  }
  if ("rows" in limits) {
    return true;
  }
  return "cols" in limits;
};

export const normalizeSplitLimits = (limits?: PanelSplitLimits): NormalizedSplitLimits => {
  if (!limits) {
    return {
      rows: Number.POSITIVE_INFINITY,
      cols: Number.POSITIVE_INFINITY,
    };
  }
  if (typeof limits === "number") {
    const normalized = clampLimit(limits);
    return { rows: normalized, cols: normalized };
  }
  if (isRowsColsLimits(limits)) {
    return {
      rows: clampLimit(limits.rows),
      cols: clampLimit(limits.cols),
    };
  }
  const legacy = limits as { maxHorizontal?: number; maxVertical?: number };
  return {
    rows: clampLimit(legacy.maxHorizontal),
    cols: clampLimit(legacy.maxVertical),
  };
};

export type SplitExtents = {
  horizontal: number;
  vertical: number;
};

export const measureSplitExtents = (tree: PanelTree): SplitExtents => {
  if (isGroup(tree)) {
    return { horizontal: 1, vertical: 1 };
  }
  const a = measureSplitExtents(tree.a);
  const b = measureSplitExtents(tree.b);
  if (tree.direction === "horizontal") {
    return { horizontal: a.horizontal + b.horizontal, vertical: Math.max(a.vertical, b.vertical) };
  }
  return { horizontal: Math.max(a.horizontal, b.horizontal), vertical: a.vertical + b.vertical };
};

const previewSplitTree = (tree: PanelTree, groupId: GroupId, direction: SplitDirection): PanelTree => {
  const { tree: preview } = splitLeaf(tree, groupId, direction, () => "__preview__");
  return preview;
};

export const canSplitDirection = (tree: PanelTree, groupId: GroupId, direction: SplitDirection, limits: NormalizedSplitLimits): boolean => {
  if (!Number.isFinite(limits.rows) && !Number.isFinite(limits.cols)) {
    return true;
  }
  const preview = previewSplitTree(tree, groupId, direction);
  const extents = measureSplitExtents(preview);
  if (extents.horizontal > limits.rows) {
    return false;
  }
  if (extents.vertical > limits.cols) {
    return false;
  }
  return true;
};
