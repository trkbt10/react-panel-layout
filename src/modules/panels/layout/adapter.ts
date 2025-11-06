/**
 * @file Adapters bridging panel-system model to existing GridLayout definitions.
 * Strategy: Use a 1x1 relative grid and place groups as absolute layers using computed rects.
 */
import type { LayerDefinition, PanelLayoutConfig } from "../../../types";
import type { GroupId, PanelSystemState, PanelTree } from "../core/types";

export type Rect = { x: number; y: number; w: number; h: number };

const isGroup = (node: PanelTree): node is Extract<PanelTree, { type: "group" }> => {
  return (node as { type: string }).type === "group";
};

export const computeRects = (node: PanelTree, bounds: Rect = { x: 0, y: 0, w: 100, h: 100 }): Map<GroupId, Rect> => {
  const result = new Map<GroupId, Rect>();
  const walk = (n: PanelTree, rect: Rect): void => {
    if (isGroup(n)) {
      result.set(n.groupId, rect);
      return;
    }
    if (n.direction === "vertical") {
      const wA = rect.w * n.ratio;
      const wB = rect.w - wA;
      walk(n.a, { x: rect.x, y: rect.y, w: wA, h: rect.h });
      walk(n.b, { x: rect.x + wA, y: rect.y, w: wB, h: rect.h });
      return;
    }
    const hA = rect.h * n.ratio;
    const hB = rect.h - hA;
    walk(n.a, { x: rect.x, y: rect.y, w: rect.w, h: hA });
    walk(n.b, { x: rect.x, y: rect.y + hA, w: rect.w, h: hB });
  };
  walk(node, bounds);
  return result;
};

export const buildGridForAbsolutePanels = (
  state: PanelSystemState,
  renderGroup: (groupId: GroupId) => React.ReactNode,
): { config: PanelLayoutConfig; layers: LayerDefinition[] } => {
  const rects = computeRects(state.tree);

  const config: PanelLayoutConfig = {
    areas: [["root"]],
    rows: [{ size: "1fr" }],
    columns: [{ size: "1fr" }],
    gap: "0px",
    style: { position: "relative" },
  };

  const layers: LayerDefinition[] = Array.from(rects.entries()).map(([groupId, r]) => {
    const style: React.CSSProperties = {
      position: "absolute",
      left: `${r.x}%`,
      top: `${r.y}%`,
      width: `${r.w}%`,
      height: `${r.h}%`,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    };
    return {
      id: groupId,
      positionMode: "absolute",
      style,
      component: renderGroup(groupId),
    } satisfies LayerDefinition;
  });

  return { config, layers };
};

export const buildGridFromRects = (
  state: PanelSystemState,
  renderGroup: (groupId: GroupId) => React.ReactNode,
  interactiveTracks: boolean,
): { config: PanelLayoutConfig; layers: LayerDefinition[] } => {
  const rects = computeRects(state.tree);

  const xs = Array.from(new Set(Array.from(rects.values()).flatMap((r) => [r.x, r.x + r.w]))).sort((a, b) => a - b);
  const ys = Array.from(new Set(Array.from(rects.values()).flatMap((r) => [r.y, r.y + r.h]))).sort((a, b) => a - b);

  const colSizes = xs.slice(1).map((x, i) => `${x - xs[i]}fr`);
  const rowSizes = ys.slice(1).map((y, i) => `${y - ys[i]}fr`);

  const columns = colSizes.map((size) => ({ size, resizable: interactiveTracks }));
  const rows = rowSizes.map((size) => ({ size, resizable: interactiveTracks }));

  const areaForCell = (x0: number, x1: number, y0: number, y1: number): string => {
    for (const [gid, r] of rects.entries()) {
      const within = x0 >= r.x && x1 <= r.x + r.w && y0 >= r.y && y1 <= r.y + r.h;
      if (within) {
        return gid;
      }
    }
    return ".";
  };

  const areas: string[][] = [];
  for (let ri = 0; ri < ys.length - 1; ri += 1) {
    const row: string[] = [];
    for (let ci = 0; ci < xs.length - 1; ci += 1) {
      row.push(areaForCell(xs[ci], xs[ci + 1], ys[ri], ys[ri + 1]));
    }
    areas.push(row);
  }

  const config: PanelLayoutConfig = {
    areas,
    rows,
    columns,
    gap: "0px",
  } as PanelLayoutConfig;

  const layers: LayerDefinition[] = Array.from(rects.keys()).map((groupId) => {
    return {
      id: groupId,
      gridArea: groupId,
      component: renderGroup(groupId),
    };
  });

  return { config, layers };
};
