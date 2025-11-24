/**
 * @file Connected group container bridging panel contexts to the presentational view.
 */
import * as React from "react";
import type { GroupId, PanelGroupRenderProps, TabBarRenderProps } from "../../panels/state/types";
import { usePanelRenderContext } from "../rendering/RenderContext";
import { useDomRegistry } from "../dom/DomRegistry";
import { PanelGroupView } from "../../../components/panels/PanelGroupView";
import { TabBar } from "../../../components/tabs/TabBar";

export type ConnectedGroupContainerProps = {
  id: GroupId;
  TabBarComponent?: React.ComponentType<TabBarRenderProps>;
  PanelGroupComponent?: React.ComponentType<PanelGroupRenderProps>;
};

export const GroupContainer: React.FC<ConnectedGroupContainerProps> = ({ id, TabBarComponent, PanelGroupComponent }) => {
  const { getGroup, getGroupContent, onClickTab, onAddTab, onCloseTab, onStartContentDrag, onStartTabDrag, doubleClickToAdd } = usePanelRenderContext();
  const { setGroupEl, setTabbarEl, setContentEl } = useDomRegistry();
  const groupRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      setGroupEl(id, el);
    },
    [id, setGroupEl],
  );
  const contentRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      setContentEl(id, el);
    },
    [id, setContentEl],
  );
  const tabbarRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      setTabbarEl(id, el);
    },
    [id, setTabbarEl],
  );
  const group = getGroup(id);
  if (!group) {
    return null;
  }
  const content = getGroupContent(id);
  const TabBarImpl = TabBarComponent ?? TabBar;
  const PanelGroupImpl: React.ComponentType<PanelGroupRenderProps> = PanelGroupComponent ?? ((props) => <PanelGroupView {...props} />);
  return (
    <PanelGroupImpl
      group={group}
      tabbar={
        <TabBarImpl
          rootRef={tabbarRef}
          group={group}
          onClickTab={(tabId) => onClickTab(id, tabId)}
          onAddTab={onAddTab}
          onCloseTab={onCloseTab}
          onStartDrag={(tabId, groupId, e) => onStartTabDrag(tabId, groupId, e)}
          doubleClickToAdd={doubleClickToAdd}
        />
      }
      content={content}
      groupRef={groupRef}
      contentRef={contentRef}
      onContentPointerDown={(e) => onStartContentDrag(id, e)}
    />
  );
};
