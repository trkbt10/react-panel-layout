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

  const tabProps: TabButtonProps = {
    type: "button",
    role: "tab",
    "aria-selected": active,
    style: tabStyle,
    onClick: handleClick,
    onPointerDown: handlePointerDown,
    "data-tab-id": tab.id,
    "data-active": active ? "true" : "false",
    "data-dragging": dragging ? "true" : "false",
    children: <span>{tab.title}</span>,
  };

  if (tabElement) {
    return tabElement(tabProps);
  }
  if (TabComponent) {
    return <TabComponent {...tabProps} />;
  }
  return <button {...tabProps} />;
};
