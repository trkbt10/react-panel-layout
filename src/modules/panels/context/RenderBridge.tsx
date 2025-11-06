/**
 * @file Bridge component that binds InteractionsContext to PanelRenderContext using panel state.
 */
import * as React from "react";
import { usePanelInteractions } from "../interactions/InteractionsContext";
import { PanelRenderProvider } from "./RenderContext";
import { usePanelState } from "./StateContext";
import { setActiveTab } from "../core/groups";

export const RenderBridge: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const interactions = usePanelInteractions();
  const { state, setState } = usePanelState();
  return (
    <PanelRenderProvider
      value={{
        getGroup: (id) => state.groups[id] ?? null,
        onClickTab: (gid, tabId) => {
          setState((prev) => setActiveTab(prev, gid, tabId));
        },
        onStartTabDrag: interactions.onStartTabDrag,
        onStartContentDrag: (groupId, e) => {
          const g = state.groups[groupId];
          if (!g || !g.activeTabId) {
            return;
          }
          interactions.onStartContentDrag(groupId, g.activeTabId, e);
        },
      }}
    >
      {children}
    </PanelRenderProvider>
  );
};
