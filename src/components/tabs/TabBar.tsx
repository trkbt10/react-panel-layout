/**
 * @file Tab bar with drag handles (generic, not panel-specific).
 */
import * as React from "react";
import styles from "./TabBar.module.css";
import type { TabBarRenderProps } from "../../modules/panels/core/types";
import { usePanelInteractions } from "../../modules/panels/interactions/InteractionsContext";

export const TabBar: React.FC<TabBarRenderProps> = ({ group, onClickTab, onStartDrag, rootRef }) => {
  const { isTabDragging, draggingTabId } = usePanelInteractions();
  return (
    <div ref={rootRef} className={styles.tabbar} role="tablist" data-tabbar="true" data-group-id={group.id} data-dragging={isTabDragging ? "true" : "false"}>
      {group.tabs.map((tab, index) => {
        const active = group.activeTabId === tab.id;
        const dragging = draggingTabId === tab.id;
        const className = `${styles.tab} ${active ? styles.tabActive : ""} ${dragging ? styles.tabDragging : ""}`.trim();
        return (
          <button
            key={`${group.id}:${tab.id}:${index}`}
            type="button"
            role="tab"
            aria-selected={active}
            className={className}
            onClick={() => {
              onClickTab(tab.id);
            }}
            onPointerDown={(e) => {
              if (!onStartDrag) {
                return;
              }
              if (e.button !== 0) {
                return;
              }
              onStartDrag(tab.id, group.id, e);
            }}
            data-tab-id={tab.id}
          >
            <span className={styles.tabTitle}>{tab.title}</span>
          </button>
        );
      })}
      <span className={styles.spacer} />
    </div>
  );
};
