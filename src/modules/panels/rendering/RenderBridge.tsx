/**
 * @file Bridge component that binds InteractionsContext to PanelRenderContext using panel state.
 */
import * as React from "react";
import { usePanelInteractions } from "../interactions/InteractionsContext";
import { PanelRenderProvider } from "./RenderContext";
import { usePanelState } from "../state/StateContext";
import { setActiveTab } from "../state/groups";

export const RenderBridge: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const interactions = usePanelInteractions();
  const { state, setState } = usePanelState();
  return (
    <PanelRenderProvider
      value={{
        getGroup: (id) => {
          const g = state.groups[id];
          if (!g) {
            return null;
          }
          // Synthesize tabs from registry + tabIds to avoid duplicated tab definitions
          const tabs = g.tabIds.map((tid) => state.panels[tid]).filter(Boolean);
          return { ...g, tabs };
        },
        onClickTab: (gid, tabId) => {
          setState((prev) => setActiveTab(prev, gid, tabId));
        },
        onStartTabDrag: (tabId, groupId, e) => {
          // Enforce activation before any drag logic (centralized; no duplication in TabBars)
          setState((prev) => setActiveTab(prev, groupId, tabId));
          interactions.onStartTabDrag(tabId, groupId, e);
        },
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
