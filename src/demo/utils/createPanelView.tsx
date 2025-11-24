/**
 * @file Demo-only connected PanelView factory that wires contexts to a presentational group view.
 */
import * as React from "react";
import type { GroupId, PanelGroupRenderProps, TabBarRenderProps } from "../../modules/panels/state/types";
import { usePanelRenderContext } from "../../modules/panels/rendering/RenderContext";
import { useDomRegistry } from "../../modules/panels/dom/DomRegistry";
import { PanelGroupView } from "../../components/panels/PanelGroupView";
import { TabBar as DefaultTabBar } from "../../components/tabs/TabBar";

export type PanelViewComponent = React.FC<{ groupId: GroupId }>;

export const createPanelView = (
  TabBarImpl?: React.ComponentType<TabBarRenderProps>,
  PanelGroupImpl?: React.ComponentType<PanelGroupRenderProps>,
): PanelViewComponent => {
  const TabBarComp = TabBarImpl ?? DefaultTabBar;
  const PanelGroupComp: React.ComponentType<PanelGroupRenderProps> = PanelGroupImpl ?? ((p) => <PanelGroupView {...p} />);
  const View: PanelViewComponent = ({ groupId }) => {
    const { getGroup, getGroupContent, onClickTab, onAddTab, onCloseTab, onStartContentDrag, onStartTabDrag, doubleClickToAdd } = usePanelRenderContext();
    const { setGroupEl, setTabbarEl, setContentEl } = useDomRegistry();

    const group = getGroup(groupId);
    if (!group) {
      return null;
    }
    const content = getGroupContent(groupId);
    const groupRef = React.useCallback((el: HTMLDivElement | null) => setGroupEl(groupId, el), [groupId, setGroupEl]);
    const contentRef = React.useCallback((el: HTMLDivElement | null) => setContentEl(groupId, el), [groupId, setContentEl]);
    const tabbarRef = React.useCallback((el: HTMLDivElement | null) => setTabbarEl(groupId, el), [groupId, setTabbarEl]);

    return (
      <PanelGroupComp
        group={group}
        tabbar={
          <TabBarComp
            rootRef={tabbarRef}
            group={group}
            onClickTab={(tabId) => onClickTab(groupId, tabId)}
            onAddTab={onAddTab}
            onCloseTab={onCloseTab}
            onStartDrag={(tabId, gid, e) => onStartTabDrag(tabId, gid, e)}
            doubleClickToAdd={doubleClickToAdd}
          />
        }
        content={content}
        groupRef={groupRef}
        contentRef={contentRef}
        onContentPointerDown={(e) => onStartContentDrag(groupId, e)}
      />
    );
  };
  View.displayName = "DemoConnectedPanelView";
  return View;
};

