/**
 * @file Thin group container that pulls state and actions from context.
 */
import * as React from "react";
import type { GroupId } from "../../modules/panels/types";
import { usePanelRenderContext } from "./PanelRenderContext";
import { PanelGroupView } from "./PanelGroupView";
import { TabBar } from "../tabs/TabBar";

export const GroupContainer: React.FC<{ id: GroupId }> = ({ id }) => {
  const { getGroup, onClickTab, onStartContentDrag, onStartTabDrag } = usePanelRenderContext();
  const group = getGroup(id);
  if (!group) {
    return null;
  }
  return (
    <PanelGroupView
      group={group}
      tabbar={
        <TabBar group={group} onClickTab={(tabId) => onClickTab(id, tabId)} onStartDrag={(tabId, groupId, e) => onStartTabDrag(tabId, groupId, e)} />
      }
      onContentPointerDown={(e) => onStartContentDrag(id, e)}
    />
  );
};
