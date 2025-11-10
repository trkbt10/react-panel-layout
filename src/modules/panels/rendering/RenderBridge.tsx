/**
 * @file Bridge component that binds InteractionsContext to PanelRenderContext using panel state.
 */
import * as React from "react";
import { usePanelInteractions } from "../interactions/InteractionsContext";
import { PanelRenderProvider } from "./RenderContext";
import { usePanelState } from "../state/StateContext";

export const RenderBridge: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const interactions = usePanelInteractions();
  const { state, actions } = usePanelState();
  const emptyContent = React.useMemo(
    () => React.createElement("div", { style: { color: "#888", fontSize: 12, padding: 12 } }, "No tabs"),
    [],
  );
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
        getGroupContent: (id) => {
          const group = state.groups[id];
          if (!group) {
            return emptyContent;
          }
          const activeTabId = group.activeTabId;
          if (!activeTabId) {
            return emptyContent;
          }
          const tab = state.panels[activeTabId];
          if (!tab) {
            return emptyContent;
          }
          return tab.render();
        },
        onClickTab: (gid, tabId) => {
          actions.setActiveTab(gid, tabId);
        },
        onStartTabDrag: (tabId, groupId, e) => {
          // Enforce activation before any drag logic (centralized; no duplication in TabBars)
          actions.setActiveTab(groupId, tabId);
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
