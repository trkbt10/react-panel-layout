/**
 * @file Tab bar with drag handles (generic, not panel-specific).
 */
import * as React from "react";
import type { TabBarRenderProps } from "../../modules/panels/state/types";
import { usePanelInteractions } from "../../modules/panels/interactions/InteractionsContext";

export type TabBarProps = TabBarRenderProps & {
  /** Custom component for the tabbar container */
  component?: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }>;
  /** Custom element for the tabbar container */
  element?: React.ReactElement;
  /** Custom component for individual tabs */
  tabComponent?: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  /** Custom element factory for individual tabs */
  tabElement?: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => React.ReactElement;
};

const tabbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const tabStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  userSelect: "none",
};

const spacerStyle: React.CSSProperties = {
  flex: "1 1 auto",
};

export const TabBar: React.FC<TabBarProps> = ({
  group,
  onClickTab,
  onStartDrag,
  rootRef,
  component: ContainerComponent,
  element,
  tabComponent: TabComponent,
  tabElement
}) => {
  const { isTabDragging, draggingTabId } = usePanelInteractions();

  const containerProps = {
    ref: rootRef,
    style: tabbarStyle,
    role: "tablist" as const,
    "data-tabbar": "true",
    "data-group-id": group.id,
    "data-dragging": isTabDragging ? "true" : "false",
  };

  const tabs = group.tabs.map((tab, index) => {
    const active = group.activeTabId === tab.id;
    const dragging = draggingTabId === tab.id;

    const tabProps = {
      key: `${group.id}:${tab.id}:${index}`,
      type: "button" as const,
      role: "tab" as const,
      "aria-selected": active,
      style: tabStyle,
      onClick: () => {
        onClickTab(tab.id);
      },
      onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!onStartDrag) {
          return;
        }
        if (e.button !== 0) {
          return;
        }
        onStartDrag(tab.id, group.id, e);
      },
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
  });

  const content = (
    <>
      {tabs}
      <span style={spacerStyle} />
    </>
  );

  if (element) {
    return React.cloneElement(element, containerProps, content);
  }
  if (ContainerComponent) {
    return <ContainerComponent {...containerProps}>{content}</ContainerComponent>;
  }
  return <div {...containerProps}>{content}</div>;
};
