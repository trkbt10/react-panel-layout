/**
 * @file Factory for connected Panel View components.
 * Consumers can provide their TabBar/PanelGroup presentation, without PanelSystem injecting operations.
 */
import * as React from "react";
import type { GroupId, PanelGroupRenderProps, TabBarRenderProps } from "../../modules/panels/state/types";
import { usePanelRenderContext } from "../../modules/panels/rendering/RenderContext";
import { useDomRegistry } from "../../modules/panels/dom/DomRegistry";
import { PanelGroupView } from "./PanelGroupView";
import { TabBar as DefaultTabBar } from "../tabs/TabBar";

export type PanelViewComponent = React.FC<{ groupId: GroupId }>;

export const createPanelView = (
  TabBarImpl?: React.ComponentType<TabBarRenderProps>,
  PanelGroupImpl?: React.ComponentType<PanelGroupRenderProps>,
): PanelViewComponent => {
  const TabBarComp = TabBarImpl ?? DefaultTabBar;
  const PanelGroupComp: React.ComponentType<PanelGroupRenderProps> = PanelGroupImpl ?? ((p) => <PanelGroupView {...p} />);
  const View: PanelViewComponent = ({ groupId }) => {
    const { getGroup, onClickTab, onStartContentDrag, onStartTabDrag } = usePanelRenderContext();
    const { setGroupEl, setTabbarEl, setContentEl } = useDomRegistry();

    const group = getGroup(groupId);
    if (!group) {
      return null;
    }
    const groupRef = React.useCallback((el: HTMLDivElement | null) => setGroupEl(groupId, el), [groupId, setGroupEl]);
    const contentRef = React.useCallback((el: HTMLDivElement | null) => setContentEl(groupId, el), [groupId, setContentEl]);
    const tabbarRef = React.useCallback((el: HTMLDivElement | null) => setTabbarEl(groupId, el), [groupId, setTabbarEl]);

    return (
      <PanelGroupComp
        group={group}
        tabbar={<TabBarComp rootRef={tabbarRef} group={group} onClickTab={(tabId) => onClickTab(groupId, tabId)} onStartDrag={(tabId, gid, e) => onStartTabDrag(tabId, gid, e)} />}
        groupRef={groupRef}
        contentRef={contentRef}
        onContentPointerDown={(e) => onStartContentDrag(groupId, e)}
      />
    );
  };
  View.displayName = "ConnectedPanelView";
  return View;
};
