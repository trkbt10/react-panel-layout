/**
 * @file Unit tests for panel-system state operations (flattened path).
 */
import { buildInitialState, splitGroup, moveTab, focusGroupIndex, nextGroup, prevGroup } from "./index";
import type { TabDefinition } from "./types";

const makeTab = (id: string, title?: string): TabDefinition => ({ id, title: title ?? id, render: () => id });

describe("panel-system state", () => {
  it("initializes with one group and active tab", () => {
    const tabs = [makeTab("a"), makeTab("b")];
    const s = buildInitialState(tabs);
    expect(s.groupOrder.length).toBe(1);
    const gid = s.groupOrder[0];
    expect(s.groups[gid].activeTabId).toBe("a");
  });

  it("splits the focused group vertically", () => {
    const tabs = [makeTab("a")];
    const s = buildInitialState(tabs);
    const gid = s.groupOrder[0];
    const s2 = splitGroup(s, gid, "vertical", () => "g_2");
    expect(s2.groupOrder.length).toBe(2);
    expect(s2.focusedGroupId).not.toBeNull();
  });

  it("moves a tab between groups and activates it", () => {
    const tabs = [makeTab("a"), makeTab("b")];
    const s1 = buildInitialState(tabs);
    const gid = s1.groupOrder[0];
    const s2 = splitGroup(s1, gid, "vertical", () => "g_2");
    const dest = s2.groupOrder[1];
    const s3 = moveTab(s2, gid, dest, "b", true);
    expect(s3.groups[dest].activeTabId).toBe("b");
    expect(s3.groups[gid].tabs.some((t) => t.id === "b")).toBe(false);
  });

  it("focus navigation works with index and cycling", () => {
    const s1 = buildInitialState([makeTab("a")]);
    const gid = s1.groupOrder[0];
    const s2 = splitGroup(s1, gid, "vertical", () => "g_2");
    const s3 = focusGroupIndex(s2, 2);
    expect(s3.focusedGroupId).toBe(s3.groupOrder[1]);
    const s4 = nextGroup(s3);
    expect(s4.focusedGroupId).toBe(s4.groupOrder[0]);
    const s5 = prevGroup(s4);
    expect(s5.focusedGroupId).toBe(s5.groupOrder[1]);
  });
});

