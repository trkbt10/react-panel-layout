/**
 * @file Regression test: tabs reorder within the same tab bar.
 */
import * as React from "react";
import { render, act } from "@testing-library/react";
import type { PanelSystemState, TabDefinition } from "../state/types";
import { buildInitialState } from "..";
import { PanelStateProvider, usePanelState } from "../state/StateContext";
import { useCommitHandlers } from "../state/commands";

type RecorderHandle = {
  handlers: ReturnType<typeof useCommitHandlers>;
  getState: () => PanelSystemState;
};

const HandlerRecorder = React.forwardRef<RecorderHandle>((_props, ref) => {
  const handlers = useCommitHandlers();
  const { state } = usePanelState();
  React.useImperativeHandle(
    ref,
    () => ({
      handlers,
      getState: () => state,
    }),
    [handlers, state],
  );
  return null;
});
HandlerRecorder.displayName = "HandlerRecorder";

const makeTabs = (): TabDefinition[] => [
  { id: "welcome", title: "Welcome", render: () => React.createElement("div", null, "Welcome") },
  { id: "explorer", title: "Explorer", render: () => React.createElement("div", null, "Explorer") },
  { id: "preview", title: "Preview", render: () => React.createElement("div", null, "Preview") },
];

describe("PanelSystem tab reorder", () => {
  it("reorders tabs within the same group", () => {
    const initial = buildInitialState(makeTabs());
    const ref = React.createRef<RecorderHandle>();

    render(
      <PanelStateProvider initialState={initial} createGroupId={() => "g_new"}>
        <HandlerRecorder ref={ref} />
      </PanelStateProvider>,
    );

    expect(ref.current).not.toBeNull();

    const targetGroupId = initial.groupOrder[0];
    act(() => {
      ref.current?.handlers.onCommitTabDrop({
        fromGroupId: targetGroupId,
        tabId: "preview",
        targetGroupId,
        targetIndex: 0,
      });
    });

    const state = ref.current?.getState();
    expect(state?.groups[targetGroupId]?.tabIds).toEqual(["preview", "welcome", "explorer"]);
    expect(state?.groups[targetGroupId]?.tabs.map((tab) => tab.id)).toEqual(["preview", "welcome", "explorer"]);
  });
});
