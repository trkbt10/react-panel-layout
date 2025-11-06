/**
 * @file Integration test: clicking tabs does not duplicate TabBar items
 */
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PanelSystem, buildPanelInitialState } from "../src";
import type { VSCodePanelTab } from "../src";

const makeTabs = (): VSCodePanelTab[] => {
  return [
    { id: "welcome", title: "Welcome", render: () => React.createElement("div", null, "Welcome") },
    { id: "explorer", title: "Explorer", render: () => React.createElement("div", null, "Explorer") },
    { id: "preview", title: "Preview", render: () => React.createElement("div", null, "Preview") },
  ];
};

const idFactory = () => {
  let i = 2;
  return () => {
    i += 1;
    return `g_${String(i)}`;
  };
};

describe("PanelSystem tabs", () => {
  it("does not duplicate tabs when clicking items", () => {
    const tabs = makeTabs();
    const initial = buildPanelInitialState(tabs);
    const createGroupId = idFactory();

    render(
      <div style={{ width: 800, height: 600 }}>
        <PanelSystem
          initialState={initial}
          createGroupId={createGroupId}
          layoutMode="grid"
          gridTracksInteractive={false}
          dragThresholdPx={6}
          style={{ width: "100%", height: "100%" }}
        />
      </div>,
    );

    const beforeTabs = screen.getAllByRole("tab");
    expect(beforeTabs.length).toBe(3);

    const explorer = screen.getByRole("tab", { name: /explorer/i });
    fireEvent.click(explorer);

    const afterTabs = screen.getAllByRole("tab");
    expect(afterTabs.length).toBe(3);

    const selected = afterTabs.filter((el) => el.getAttribute("aria-selected") === "true");
    expect(selected.length).toBe(1);
  });
});
