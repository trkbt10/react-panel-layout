/**
 * @file Integration test: empty groups are auto-cleaned (no empty tabbars remain)
 */
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { PanelSystem } from "./PanelSystem";
import { buildInitialState, splitLeaf, createEmptyGroup } from "..";
import type { TabDefinition } from "..";

const makeTabs = (): TabDefinition[] => {
  return [
    { id: "welcome", title: "Welcome", render: () => React.createElement("div", null, "Welcome") },
  ];
};

describe("PanelSystem empty groups cleanup", () => {
  it("collapses empty groups so only non-empty tabbars render", () => {
    const tabs = makeTabs();
    const initial = buildInitialState(tabs);
    // Split once to create a second, empty group
    const { tree, newGroupId } = splitLeaf(initial.tree, initial.groupOrder[0], "vertical", () => "g_2");
    const state = {
      ...initial,
      tree,
      groupOrder: [initial.groupOrder[0], newGroupId],
      groups: { ...initial.groups, [newGroupId]: createEmptyGroup(newGroupId) },
    };

    const Wrapper: React.FC = () => {
      const [s, setS] = React.useState(state);
      return (
        <div style={{ width: 800, height: 600 }}>
          <PanelSystem
            initialState={s}
            state={s}
            onStateChange={setS}
            createGroupId={() => `g_${Math.random().toString(36).slice(2, 6)}`}
            layoutMode="grid"
            gridTracksInteractive={false}
            dragThresholdPx={6}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      );
    };

    render(<Wrapper />);

    // After mount, the empty split is cleaned up; only one tablist remains
    const tablists = screen.getAllByRole("tablist");
    expect(tablists.length).toBe(1);
  });
});
