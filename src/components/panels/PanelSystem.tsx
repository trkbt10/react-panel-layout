/**
 * @file VSCode-like PanelSystem component (tabs + splits + drag/drop + keybindings)
 */
import * as React from "react";
import styles from "./PanelSystem.module.css";
import type { GroupId, PanelSystemProps, PanelSystemState, SplitDirection, PanelCommands } from "../../modules/panels/types";
import { KeybindingsProvider, registerDefaultBindings } from "../../modules/keybindings/KeybindingsProvider";
import type { KeybindingsContextValue } from "../../modules/keybindings/KeybindingsProvider";
import { moveTab, setActiveTab, setFocusedGroup, splitGroup, focusGroupIndex as focusIdx, nextGroup, prevGroup } from "../../modules/panels";
import { buildGridForAbsolutePanels, buildGridFromRects } from "../../modules/panels/adapter";
import { GridLayout } from "../grid/GridLayout";
import { GroupContainer } from "./GroupContainer";
import { PanelRenderProvider } from "./PanelRenderContext";
import { InteractionsProvider, usePanelInteractions } from "./InteractionsContext";
import { DropSuggestOverlay } from "./DropSuggestOverlay";

export const PanelSystem: React.FC<PanelSystemProps> = ({ initialState, createGroupId, layoutMode, gridTracksInteractive, dragThresholdPx, state: controlled, onStateChange, className, style }) => {
  if (!initialState) { throw new Error("PanelSystem requires initialState."); }
  if (!createGroupId) { throw new Error("PanelSystem requires explicit createGroupId function."); }
  if (!layoutMode) { throw new Error("PanelSystem requires explicit layoutMode ('absolute' | 'grid')."); }
  if (layoutMode === "grid" && gridTracksInteractive === undefined) { throw new Error("PanelSystem(layoutMode='grid') requires explicit 'gridTracksInteractive' flag."); }
  if (dragThresholdPx === undefined) { throw new Error("PanelSystem requires explicit 'dragThresholdPx' value."); }

  const [uncontrolled, setUncontrolled] = React.useState<PanelSystemState>(initialState);
  const state = controlled ?? uncontrolled;
  const setState = React.useCallback((updater: (prev: PanelSystemState) => PanelSystemState) => {
    const next = updater(state);
    if (onStateChange) onStateChange(next);
    if (!controlled) setUncontrolled(next);
  }, [state, controlled, onStateChange]);

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const onRenderGroup = React.useCallback((gid: GroupId): React.ReactNode => <GroupContainer id={gid} />, []);
  const grid = React.useMemo(() => {
    if (layoutMode === "grid") {
      return buildGridFromRects(state, onRenderGroup, Boolean(gridTracksInteractive));
    }
    return buildGridForAbsolutePanels(state, onRenderGroup);
  }, [layoutMode, gridTracksInteractive, state, onRenderGroup]);

  const commands = React.useMemo<PanelCommands>(() => ({
    splitFocused: (direction) => {
      setState((prev) => {
        const gid = prev.focusedGroupId ?? prev.groupOrder[0] ?? null;
        if (!gid) {
          return prev;
        }
        return splitGroup(prev, gid, direction, createGroupId);
      });
    },
    focusGroupIndex: (n) => { setState((prev) => focusIdx(prev, n)); },
    focusNextGroup: () => { setState((prev) => nextGroup(prev)); },
    focusPrevGroup: () => { setState((prev) => prevGroup(prev)); },
    closeFocusedGroup: () => {},
  }), [setState]);
  const keyConfig = React.useCallback((api: KeybindingsContextValue): void => {
    registerDefaultBindings(api, commands);
  }, [commands]);

  const InteractionsBridge: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const interactions = usePanelInteractions();
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
        <DropSuggestOverlay suggest={interactions.suggest} />
      </PanelRenderProvider>
    );
  };

  return (
    <KeybindingsProvider configure={keyConfig}>
      <InteractionsProvider
        containerRef={containerRef}
        dragThresholdPx={dragThresholdPx}
        onCommitContentDrop={({ fromGroupId, tabId, targetGroupId, zone }) => {
          setState((prev) => {
            if (targetGroupId === fromGroupId && zone === "center") {
              const group = prev.groups[fromGroupId];
              const tab = group.tabs.find((t) => t.id === tabId);
              if (!tab) return prev;
              return setActiveTab(prev, fromGroupId, tabId);
            }
            const fromGroup = prev.groups[fromGroupId];
            const tab = fromGroup.tabs.find((t) => t.id === tabId);
            if (!tab) return prev;
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
        }}
        onCommitTabDrop={({ fromGroupId, tabId, targetGroupId, targetIndex }) => {
          setState((prev) => {
            const from = prev.groups[fromGroupId];
            const tab = from.tabs.find((t) => t.id === tabId);
            if (!tab) return prev;
            if (fromGroupId === targetGroupId) {
              const groups = { ...prev.groups };
              const group = groups[fromGroupId];
              const currentIndex = group.tabs.findIndex((t) => t.id === tabId);
              if (currentIndex === -1) return prev;
              const bounded = Math.max(0, Math.min(targetIndex, group.tabs.length - 1));
              if (bounded === currentIndex) return prev;
              const tabs = group.tabs.slice();
              const [movedTab] = tabs.splice(currentIndex, 1);
              tabs.splice(bounded, 0, movedTab);
              groups[fromGroupId] = { ...group, tabs };
              return { ...prev, groups };
            }
            const groups = { ...prev.groups };
            const fromTabs = groups[fromGroupId].tabs.filter((t) => t.id !== tabId);
            groups[fromGroupId] = { ...groups[fromGroupId], tabs: fromTabs, activeTabId: groups[fromGroupId].activeTabId === tabId ? fromTabs[0]?.id ?? null : groups[fromGroupId].activeTabId };
            const target = groups[targetGroupId];
            const bounded = Math.max(0, Math.min(targetIndex, target.tabs.length));
            const toTabs = target.tabs.slice();
            toTabs.splice(bounded, 0, tab);
            groups[targetGroupId] = { ...target, tabs: toTabs, activeTabId: tabId };
            return { ...prev, groups, focusedGroupId: targetGroupId };
          });
        }}
      >
        <InteractionsBridge>
          <div ref={containerRef} className={className ? `${styles.root} ${className}` : styles.root} style={style}>
            <GridLayout config={grid.config} layers={grid.layers} />
          </div>
        </InteractionsBridge>
      </InteractionsProvider>
    </KeybindingsProvider>
  );
};

export { buildInitialState } from "../../modules/panels";
