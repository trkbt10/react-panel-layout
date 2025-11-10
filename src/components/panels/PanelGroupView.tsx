/**
 * @file Group view rendering for PanelSystem (tabbar + active content).
 */
import * as React from "react";
import type { PanelGroupRenderProps } from "../../modules/panels/state/types";
import groupStyles from "./PanelGroupView.module.css";

const RawPanelGroupView: React.FC<PanelGroupRenderProps> = ({ group, tabbar, content, onContentPointerDown, groupRef, contentRef }) => {
  return (
    <div ref={groupRef} className={groupStyles.group} data-group-id={group.id}>
      {tabbar}
      <div ref={contentRef} className={groupStyles.content} data-dnd-zone="content" onPointerDown={onContentPointerDown}>
        {content}
      </div>
    </div>
  );
};

export const PanelGroupView = React.memo(RawPanelGroupView, (prev, next) => {
  if (prev.group.id !== next.group.id) {
    return false;
  }
  if (prev.group.activeTabId !== next.group.activeTabId) {
    return false;
  }
  if (prev.group.tabs.length !== next.group.tabs.length) {
    return false;
  }
  return prev.group.tabs === next.group.tabs;
});
PanelGroupView.displayName = "PanelGroupView";
