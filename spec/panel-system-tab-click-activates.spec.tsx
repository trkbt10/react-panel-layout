/**
 * @file Integration test: clicking a tab activates it even with DnD enabled
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

describe("PanelSystem tab click activates", () => {
  it("activates clicked tab reliably", () => {
    const tabs = makeTabs();
    const initial = buildPanelInitialState(tabs);

    render(
      <div style={{ width: 800, height: 600 }}>
        <PanelSystem
          initialState={initial}
          createGroupId={() => "g_2"}
          layoutMode="grid"
          gridTracksInteractive={false}
          dragThresholdPx={6}
          style={{ width: "100%", height: "100%" }}
        />
      </div>,
    );

    // Click Explorer tab
    const before = screen.getByRole("tab", { name: /explorer/i });
    fireEvent.click(before);
    const explorer = screen.getByRole("tab", { name: /explorer/i });
    // Activated tab has aria-selected=true (re-query to avoid stale node)
    expect(explorer.getAttribute("aria-selected")).toBe("true");
    // Content render will include the same label; aria-selected check is sufficient
  });
});
