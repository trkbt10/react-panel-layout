/**
 * @file Bridge component that binds InteractionsContext to PanelRenderContext using panel state.
 */
import * as React from "react";
import { usePanelInteractions } from "../interactions/InteractionsContext";
import { PanelRenderProvider } from "./RenderContext";
import { usePanelState } from "../state/StateContext";
import { ContentRegistryProvider, useContentRegistry } from "./ContentRegistry";
import type { PanelId, GroupId } from "../state/types";

type PanelPlacement = {
  groupId: GroupId;
  isActive: boolean;
};

const RenderBridgeInner: React.FC<React.PropsWithChildren<{ emptyContentComponent?: React.ComponentType; doubleClickToAdd?: boolean }>> = ({
  children,
  emptyContentComponent,
  doubleClickToAdd,
}) => {
  const interactions = usePanelInteractions();
  const { state, actions } = usePanelState();
  const { registerContentContainer } = useContentRegistry();

  const DefaultEmpty: React.FC = React.useCallback(() => {
    return React.createElement("div", { style: { color: "#888", fontSize: 12, padding: 12 } }, "No tabs");
  }, []);
  const Empty = emptyContentComponent ?? DefaultEmpty;

  const getGroup = React.useCallback(
    (id: string) => {
      const g = state.groups[id];
      if (!g) {
        return null;
      }
      const tabs = g.tabIds.map((tid) => state.panels[tid]).filter(Boolean);
      return { ...g, tabs };
    },
    [state.groups, state.panels],
  );

  const getGroupContent = React.useCallback(
    (id: string) => {
      const group = state.groups[id];
      if (!group || group.tabIds.length === 0) {
        return <Empty />;
      }
      // Content is rendered via Portal from ContentRegistry
      return null;
    },
    [state.groups, Empty],
  );

  const onClickTab = React.useCallback((gid: string, tabId: string) => {
    actions.setActiveTab(gid, tabId);
  }, [actions]);

  const onAddTab = React.useCallback((gid: string) => {
    actions.addNewTab({ groupId: gid, title: "New Tab", makeActive: true });
  }, [actions]);

  const onCloseTab = React.useCallback((gid: string, tabId: string) => {
    actions.removeTab(gid, tabId);
  }, [actions]);

  const onStartTabDrag = React.useCallback((tabId: string, groupId: string, e: React.PointerEvent) => {
    actions.setActiveTab(groupId, tabId);
    interactions.onStartTabDrag(tabId, groupId, e);
  }, [actions, interactions]);

  const onStartContentDrag = React.useCallback((groupId: string, e: React.PointerEvent<HTMLDivElement>) => {
    const g = state.groups[groupId];
    if (!g || !g.activeTabId) {
      return;
    }
    interactions.onStartContentDrag(groupId, g.activeTabId, e);
  }, [state.groups, interactions]);

  const value = React.useMemo(
    () => ({ getGroup, getGroupContent, onClickTab, onAddTab, onCloseTab, onStartTabDrag, onStartContentDrag, doubleClickToAdd, registerContentContainer }),
    [getGroup, getGroupContent, onClickTab, onAddTab, onCloseTab, onStartTabDrag, onStartContentDrag, doubleClickToAdd, registerContentContainer],
  );

  return <PanelRenderProvider value={value}>{children}</PanelRenderProvider>;
};

export const RenderBridge: React.FC<React.PropsWithChildren<{ emptyContentComponent?: React.ComponentType; doubleClickToAdd?: boolean }>> = ({
  children,
  emptyContentComponent,
  doubleClickToAdd,
}) => {
  const { state } = usePanelState();

  // Compute placements: which group each panel belongs to and if it's active
  const placements = React.useMemo(() => {
    const result: Record<PanelId, PanelPlacement> = {};
    for (const [groupId, group] of Object.entries(state.groups)) {
      for (const tabId of group.tabIds) {
        result[tabId] = {
          groupId,
          isActive: tabId === group.activeTabId,
        };
      }
    }
    return result;
  }, [state.groups]);

  return (
    <ContentRegistryProvider panels={state.panels} placements={placements}>
      <RenderBridgeInner emptyContentComponent={emptyContentComponent} doubleClickToAdd={doubleClickToAdd}>
        {children}
      </RenderBridgeInner>
    </ContentRegistryProvider>
  );
};
