/**
 * @file Integration-like tests for PanelSystemProvider split limits.
 */
import * as React from "react";
import { act, renderHook } from "@testing-library/react";
import { PanelStateProvider, usePanelState } from "./StateContext";
import { buildInitialState } from "..";
import type { TabDefinition } from "./types";

const makeTab = (id: string): TabDefinition => ({ id, title: id, render: () => id });

const createIdFactory = (): (() => string) => {
  const counter = { value: 1 };
  return () => {
    counter.value += 1;
    return `g_${counter.value}`;
  };
};

describe("PanelSystemProvider split limits", () => {
  it("blocks splitFocused when vertical limit is reached", () => {
    const initial = buildInitialState([makeTab("a")]);
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <PanelStateProvider initialState={initial} createGroupId={createIdFactory()} splitLimits={{ cols: 1 }}>
        {children}
      </PanelStateProvider>
    );
    const { result } = renderHook(() => usePanelState(), { wrapper });
    act(() => {
      result.current.actions.splitFocused("vertical");
    });
    expect(result.current.state.groupOrder.length).toBe(1);
  });

  it("ignores content drops that would violate horizontal limit", () => {
    const tabs = [makeTab("a"), makeTab("b")];
    const initial = buildInitialState(tabs);
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <PanelStateProvider initialState={initial} createGroupId={createIdFactory()} splitLimits={{ rows: 1 }}>
        {children}
      </PanelStateProvider>
    );
    const { result } = renderHook(() => usePanelState(), { wrapper });
    const gid = result.current.state.groupOrder[0];
    act(() => {
      result.current.actions.contentDrop({ fromGroupId: gid, tabId: tabs[0].id, targetGroupId: gid, zone: "top" });
    });
    expect(result.current.state.groupOrder.length).toBe(1);
  });
});
