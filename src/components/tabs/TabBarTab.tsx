/**
 * @file Tab button renderer for TabBar.
 */
import * as React from "react";
import type { TabBarProps } from "./TabBar";

type TabItem = TabBarProps["group"]["tabs"][number];

type TabButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  "data-tab-id": string;
  "data-active": "true" | "false";
  "data-dragging": "true" | "false";
};

export type TabBarTabProps = {
  groupId: string;
  tab: TabItem;
  active: boolean;
  dragging: boolean;
  tabComponent?: TabBarProps["tabComponent"];
  tabElement?: TabBarProps["tabElement"];
  onClickTab: TabBarProps["onClickTab"];
  onStartDrag: TabBarProps["onStartDrag"];
  onCloseTab?: (groupId: string, tabId: string) => void;
};

const tabStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  userSelect: "none",
};

export const TabBarTab: React.FC<TabBarTabProps> = ({
  groupId,
  tab,
  active,
  dragging,
  onClickTab,
  onStartDrag,
  onCloseTab,
  tabComponent: TabComponent,
  tabElement,
}) => {
  const handleClick = React.useEffectEvent(() => {
    onClickTab(tab.id);
  });

  const handlePointerDown = React.useEffectEvent((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!onStartDrag) {
      return;
    }
    if (e.button !== 0) {
      return;
    }
    onStartDrag(tab.id, groupId, e);
  });

  const renderCloseButton = (): React.ReactNode => {
    const hasClose = Boolean(onCloseTab);
    return (
      <React.Activity mode={hasClose ? "visible" : "hidden"}>
        <button
          type="button"
          aria-label={`Close tab ${tab.title}`}
          onClick={(e) => {
            if (!onCloseTab) {
              return;
            }
            e.stopPropagation();
            onCloseTab(groupId, tab.id);
          }}
          style={{ marginLeft: 6 }}
          tabIndex={hasClose ? undefined : -1}
          disabled={!hasClose}
          aria-hidden={hasClose ? undefined : true}
        >
          ×
        </button>
      </React.Activity>
    );
  };

  const tabProps: TabButtonProps = {
    type: "button",
    role: "tab",
    "aria-selected": active,
    tabIndex: active ? 0 : -1,
    style: tabStyle,
    onClick: handleClick,
    onPointerDown: handlePointerDown,
    "data-tab-id": tab.id,
    "data-active": active ? "true" : "false",
    "data-dragging": dragging ? "true" : "false",
    children: (
      <>
        <span>{tab.title}</span>
        {renderCloseButton()}
      </>
    ),
  };

  if (tabElement) {
    return tabElement(tabProps);
  }
  if (TabComponent) {
    return <TabComponent {...tabProps} />;
  }
  return <button {...tabProps} />;
};
