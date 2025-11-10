/**
 * @file Unit tests for panel-system tree operations
 */
import type { PanelTree } from "./types";
import { setSplitRatio } from "./tree";

describe("panel-tree setSplitRatio", () => {
  it("updates ratio and clamps to bounds", () => {
    const tree: PanelTree = {
      type: "split",
      direction: "vertical",
      ratio: 0.5,
      a: { type: "group", groupId: "g_1" },
      b: { type: "group", groupId: "g_2" },
    };
    const next = setSplitRatio(tree, [], 0.2);
    if (next.type !== "split") {
      throw new Error("expected split node");
    }
    expect(next.ratio).toBeCloseTo(0.2);

    const over = setSplitRatio(tree, [], -10);
    if (over.type !== "split") {
      throw new Error("expected split node");
    }
    expect(over.ratio).toBeCloseTo(0.05);

    const big = setSplitRatio(tree, [], 10);
    if (big.type !== "split") {
      throw new Error("expected split node");
    }
    expect(big.ratio).toBeCloseTo(0.95);
  });
});
