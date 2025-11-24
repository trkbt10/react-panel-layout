/**
 * @file Chrome-style tab bar component (demo only)
 */
import * as React from "react";
import styles from "./ChromeTabBar.module.css";
import type { TabBarRenderProps } from "../../../modules/panels/state/types";
import { useDemoTabbarConfig } from "../../contexts/TabbarDemoConfig";
import { usePanelInteractions } from "../../../modules/panels/interactions/InteractionsContext";

export const ChromeTabBar: React.FC<TabBarRenderProps> = ({ group, onClickTab, onStartDrag, rootRef, onAddTab, onCloseTab, doubleClickToAdd }) => {
  const { isTabDragging, draggingTabId } = usePanelInteractions();
  const { addPlacement, doubleClickToAdd: configDoubleClick, AddButton, CloseButton } = useDemoTabbarConfig();
  const enableDoubleClick = doubleClickToAdd ?? configDoubleClick;
  const handleTabbarDoubleClick = React.useCallback((): void => {
    if (enableDoubleClick && onAddTab) {
      onAddTab(group.id);
    }
  }, [enableDoubleClick, onAddTab, group.id]);
  const renderAddButton = (): React.ReactNode => {
    if (!onAddTab) {
      return null;
    }
    if (AddButton) {
      return <AddButton onClick={() => onAddTab(group.id)} ariaLabel="Add tab" className={styles.addButton} />;
    }
    return (
      <button type="button" aria-label="Add tab" className={styles.addButton} onClick={() => onAddTab(group.id)}>
        +
      </button>
    );
  };
  return (
    <div ref={rootRef} className={styles.tabbar} role="tablist" data-tabbar="true" data-group-id={group.id} data-dragging={isTabDragging ? "true" : "false"} onDoubleClick={handleTabbarDoubleClick}>
      {buildTabs()}
      <span className={styles.spacer} />
      {addPlacement === "trailing" ? renderAddButton() : null}
    </div>
  );

  function renderCloseButton(tabTitle: string, tabId: string): React.ReactNode {
    const handleClick = (ev: React.MouseEvent): void => {
      if (!onCloseTab) {
        return;
      }
      ev.stopPropagation();
      onCloseTab(group.id, tabId);
    };
    const button = CloseButton ? (
      <CloseButton onClick={handleClick} ariaLabel={`Close tab ${tabTitle}`} className={styles.closeButton} />
    ) : (
      <button
        type="button"
        aria-label={`Close tab ${tabTitle}`}
        className={styles.closeButton}
        onClick={handleClick}
        tabIndex={onCloseTab ? undefined : -1}
        disabled={!onCloseTab}
        aria-hidden={onCloseTab ? undefined : true}
      >
        ×
      </button>
    );
    return <span onPointerDown={(ev) => ev.stopPropagation()}>{button}</span>;
  }

  function buildTabs(): React.ReactNode[] {
    const items: React.ReactNode[] = [];
    group.tabs.forEach((tab, index) => {
        const active = group.activeTabId === tab.id;
        const dragging = draggingTabId === tab.id;
        const className = `${styles.tab} ${active ? styles.tabActive : ""} ${dragging ? styles.tabDragging : ""}`.trim();
        items.push(
          <div
            key={`${group.id}:${tab.id}:${index}`}
            role="tab"
            aria-selected={active}
            className={className}
            onClick={() => {
              onClickTab(tab.id);
            }}
            onDoubleClick={(e) => e.stopPropagation()}
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
            <React.Activity mode={onCloseTab ? "visible" : "hidden"}>
              {renderCloseButton(tab.title, tab.id)}
            </React.Activity>
          </div>
        );
        if (addPlacement === "after-active" && active) {
          items.push(<span key={`add-after-${tab.id}`}>{renderAddButton()}</span>);
        }
      });
    if (addPlacement === "after-tabs") {
      items.push(<span key="add-after-tabs">{renderAddButton()}</span>);
    }
    return items;
  }
};
