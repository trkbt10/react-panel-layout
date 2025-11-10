/**
 * @file Connected PanelView factory that wires contexts to the presentational group view.
 */
import * as React from "react";
import type { GroupId, PanelGroupRenderProps, TabBarRenderProps } from "../../panels/state/types";
import { usePanelRenderContext } from "../rendering/RenderContext";
import { useDomRegistry } from "../dom/DomRegistry";
import { PanelGroupView } from "../../../components/panels/PanelGroupView";
import { TabBar as DefaultTabBar } from "../../../components/tabs/TabBar";

export type PanelViewComponent = React.FC<{ groupId: GroupId }>;

export const createPanelView = (
  TabBarImpl?: React.ComponentType<TabBarRenderProps>,
  PanelGroupImpl?: React.ComponentType<PanelGroupRenderProps>,
): PanelViewComponent => {
  const TabBarComp = TabBarImpl ?? DefaultTabBar;
  const PanelGroupComp: React.ComponentType<PanelGroupRenderProps> = PanelGroupImpl ?? ((p) => <PanelGroupView {...p} />);
  const View: PanelViewComponent = ({ groupId }) => {
    const { getGroup, getGroupContent, onClickTab, onStartContentDrag, onStartTabDrag } = usePanelRenderContext();
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
            onStartDrag={(tabId, gid, e) => onStartTabDrag(tabId, gid, e)}
          />
        }
        content={content}
        groupRef={groupRef}
        contentRef={contentRef}
        onContentPointerDown={(e) => onStartContentDrag(groupId, e)}
      />
    );
  };
  View.displayName = "ConnectedPanelView";
  return View;
};
