/**
 * @file Thin group container that pulls state and actions from context.
 */
import * as React from "react";
import type { GroupId, PanelGroupRenderProps, TabBarRenderProps } from "../../modules/panels/core/types";
import { usePanelRenderContext } from "../../modules/panels/context/RenderContext";
import { useDomRegistry } from "../../modules/panels/context/DomRegistry";
import { PanelGroupView } from "./PanelGroupView";
import { TabBar } from "../tabs/TabBar";

export const GroupContainer: React.FC<{ id: GroupId; TabBarComponent?: React.ComponentType<TabBarRenderProps>; PanelGroupComponent?: React.ComponentType<PanelGroupRenderProps> }> = ({ id, TabBarComponent, PanelGroupComponent }) => {
  const { getGroup, onClickTab, onStartContentDrag, onStartTabDrag } = usePanelRenderContext();
  const { setGroupEl, setTabbarEl, setContentEl } = useDomRegistry();
  const groupRef = React.useCallback((el: HTMLDivElement | null) => {
    setGroupEl(id, el);
  }, [id, setGroupEl]);
  const contentRef = React.useCallback((el: HTMLDivElement | null) => {
    setContentEl(id, el);
  }, [id, setContentEl]);
  const tabbarRef = React.useCallback((el: HTMLDivElement | null) => {
    setTabbarEl(id, el);
  }, [id, setTabbarEl]);
  const group = getGroup(id);
  if (!group) {
    return null;
  }
  const TabBarImpl = TabBarComponent ?? TabBar;
  const PanelGroupImpl: React.ComponentType<PanelGroupRenderProps> = PanelGroupComponent ?? ((props) => <PanelGroupView {...props} />);
  return (
    <PanelGroupImpl
      group={group}
      tabbar={<TabBarImpl rootRef={tabbarRef} group={group} onClickTab={(tabId) => onClickTab(id, tabId)} onStartDrag={(tabId, groupId, e) => onStartTabDrag(tabId, groupId, e)} />}
      groupRef={groupRef}
      contentRef={contentRef}
      onContentPointerDown={(e) => onStartContentDrag(id, e)}
    />
  );
};
