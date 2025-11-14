/**
 * @file Tests for split limit helpers.
 */
import type { PanelTree } from "./types";
import { measureSplitExtents, normalizeSplitLimits, canSplitDirection } from "./splitLimits";

const group = (id: string): PanelTree => ({ type: "group", groupId: id });

const horizontal = (a: PanelTree, b: PanelTree): PanelTree => ({ type: "split", direction: "horizontal", ratio: 0.5, a, b });
const vertical = (a: PanelTree, b: PanelTree): PanelTree => ({ type: "split", direction: "vertical", ratio: 0.5, a, b });

describe("split limit helpers", () => {
  it("measures split extents per direction", () => {
    const base = group("g1");
    expect(measureSplitExtents(base)).toEqual({ horizontal: 1, vertical: 1 });

    const withVertical = vertical(group("g1"), group("g2"));
    expect(measureSplitExtents(withVertical)).toEqual({ horizontal: 1, vertical: 2 });

    const nested = horizontal(withVertical, group("g3"));
    expect(measureSplitExtents(nested)).toEqual({ horizontal: 2, vertical: 2 });

    const deep = horizontal(vertical(group("g1"), group("g2")), vertical(group("g3"), group("g4")));
    expect(measureSplitExtents(deep)).toEqual({ horizontal: 2, vertical: 2 });
  });

  it("prevents splits when limits would be exceeded", () => {
    const limits = normalizeSplitLimits({ cols: 1, rows: 2 });
    const base = group("g1");
    expect(canSplitDirection(base, "g1", "vertical", limits)).toBe(false);
    expect(canSplitDirection(base, "g1", "horizontal", limits)).toBe(true);

    const withHorizontal = horizontal(group("g1"), group("g2"));
    const verticalLimits = normalizeSplitLimits({ cols: 2 });
    expect(canSplitDirection(withHorizontal, "g1", "horizontal", normalizeSplitLimits({ rows: 2 }))).toBe(false);
    expect(canSplitDirection(withHorizontal, "g1", "vertical", verticalLimits)).toBe(true);
  });

  it("supports shorthand and legacy limit shapes", () => {
    expect(normalizeSplitLimits(2)).toEqual({ rows: 2, cols: 2 });
    expect(normalizeSplitLimits({ rows: 1 })).toEqual({ rows: 1, cols: Number.POSITIVE_INFINITY });
    expect(normalizeSplitLimits({ cols: 3 })).toEqual({ rows: Number.POSITIVE_INFINITY, cols: 3 });
    expect(normalizeSplitLimits({ maxHorizontal: 4 })).toEqual({ rows: 4, cols: Number.POSITIVE_INFINITY });
    expect(normalizeSplitLimits({ maxVertical: 5 })).toEqual({ rows: Number.POSITIVE_INFINITY, cols: 5 });
  });
});
