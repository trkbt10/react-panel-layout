/**
 * @file Hooks that expose commands and commit handlers for the panel system.
 */
import * as React from "react";
import type { DropZone, PanelCommands, SplitDirection } from "../core/types";
import { usePanelState } from "./StateContext";
import { moveTab, setActiveTab, setFocusedGroup, splitGroup, focusGroupIndex as focusIdx, nextGroup, prevGroup } from "../index";

export const usePanelCommands = (): PanelCommands => {
  const { state, setState, createGroupId } = usePanelState();
  return React.useMemo<PanelCommands>(
    () => ({
      splitFocused: (direction) => {
        setState((prev) => {
          const gid = prev.focusedGroupId ?? prev.groupOrder[0] ?? null;
          if (!gid) {
            return prev;
          }
          return splitGroup(prev, gid, direction, createGroupId);
        });
      },
      focusGroupIndex: (n) => {
        setState((prev) => focusIdx(prev, n));
      },
      focusNextGroup: () => {
        setState((prev) => nextGroup(prev));
      },
      focusPrevGroup: () => {
        setState((prev) => prevGroup(prev));
      },
      closeFocusedGroup: () => {
        // intentionally no-op for now
      },
    }),
    [setState, createGroupId, state],
  );
};

export const useCommitHandlers = (): {
  onCommitContentDrop: (payload: { fromGroupId: string; tabId: string; targetGroupId: string; zone: DropZone }) => void;
  onCommitTabDrop: (payload: { fromGroupId: string; tabId: string; targetGroupId: string; targetIndex: number }) => void;
} => {
  const { setState, createGroupId } = usePanelState();

  const onCommitContentDrop = React.useCallback(
    ({ fromGroupId, tabId, targetGroupId, zone }: { fromGroupId: string; tabId: string; targetGroupId: string; zone: DropZone }) => {
      setState((prev) => {
        if (targetGroupId === fromGroupId && zone === "center") {
          const group = prev.groups[fromGroupId];
          const tab = group.tabs.find((t) => t.id === tabId);
          if (!tab) {
            return prev;
          }
          return setActiveTab(prev, fromGroupId, tabId);
        }
        const fromGroup = prev.groups[fromGroupId];
        const tab = fromGroup.tabs.find((t) => t.id === tabId);
        if (!tab) {
          return prev;
        }
        if (zone === "center") {
          const moved = moveTab(prev, fromGroupId, targetGroupId, tabId, true);
          return setFocusedGroup(moved, targetGroupId);
        }
        const direction: SplitDirection = zone === "left" || zone === "right" ? "vertical" : "horizontal";
        const newId = createGroupId();
        const afterSplit = splitGroup(prev, targetGroupId, direction, () => newId);
        const dest = zone === "left" || zone === "top" ? targetGroupId : newId;
        const withTab = moveTab(afterSplit, fromGroupId, dest, tabId, true);
        return setFocusedGroup(withTab, dest);
      });
    },
    [setState, createGroupId],
  );

  const onCommitTabDrop = React.useCallback(
    ({ fromGroupId, tabId, targetGroupId, targetIndex }: { fromGroupId: string; tabId: string; targetGroupId: string; targetIndex: number }) => {
      setState((prev) => {
        const from = prev.groups[fromGroupId];
        const tab = from.tabs.find((t) => t.id === tabId);
        if (!tab) {
          return prev;
        }
        if (fromGroupId === targetGroupId) {
          const groups = { ...prev.groups };
          const group = groups[fromGroupId];
          const currentIndex = group.tabIds.findIndex((id) => id === tabId);
          if (currentIndex === -1) {
            return prev;
          }
          const filteredIds = group.tabIds.filter((id) => id !== tabId);
          const insertIndex = Math.max(0, Math.min(targetIndex, filteredIds.length));
          const nextTabIds = filteredIds.slice(0, insertIndex).concat([tabId], filteredIds.slice(insertIndex));
          const nextTabs = nextTabIds.map((id) => prev.panels[id]).filter(Boolean);
          groups[fromGroupId] = { ...group, tabIds: nextTabIds, tabs: nextTabs };
          return { ...prev, groups };
        }
        const groups = { ...prev.groups };
        const fromTabs = groups[fromGroupId].tabs.filter((t) => t.id !== tabId);
        groups[fromGroupId] = {
          ...groups[fromGroupId],
          tabs: fromTabs,
          activeTabId: groups[fromGroupId].activeTabId === tabId ? fromTabs[0]?.id ?? null : groups[fromGroupId].activeTabId,
        };
        const target = groups[targetGroupId];
        const existingFiltered = target.tabs.filter((t) => t.id !== tabId);
        const bounded = Math.max(0, Math.min(targetIndex, existingFiltered.length));
        const toTabs = existingFiltered.slice(0, bounded).concat([tab], existingFiltered.slice(bounded));
        groups[targetGroupId] = { ...target, tabs: toTabs, activeTabId: tabId };
        return { ...prev, groups, focusedGroupId: targetGroupId };
      });
    },
    [setState],
  );

  return { onCommitContentDrop, onCommitTabDrop };
};
