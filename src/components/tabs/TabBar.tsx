/**
 * @file Tab bar with drag handles (generic, not panel-specific).
 */
import * as React from "react";
import type { TabBarRenderProps } from "../../modules/panels/state/types";
import { usePanelInteractions } from "../../modules/panels/interactions/InteractionsContext";
import { useElementComponentWrapper } from "../../hooks/useElementComponentWrapper";
import { TabBarTab } from "./TabBarTab";

export type TabBarProps = TabBarRenderProps & {
  /** Custom component for the tabbar container */
  component?: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }>;
  /** Custom element for the tabbar container */
  element?: React.ReactElement<React.HTMLAttributes<HTMLDivElement>>;
  /** Custom component for individual tabs */
  tabComponent?: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  /** Custom element factory for individual tabs */
  tabElement?: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => React.ReactElement;
};

const tabbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
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
  tabElement,
}) => {
  const { isTabDragging, draggingTabId } = usePanelInteractions();

  const containerProps = {
    style: tabbarStyle,
    role: "tablist" as const,
    "data-tabbar": "true",
    "data-group-id": group.id,
    "data-dragging": isTabDragging ? "true" : "false",
  };

  const Wrapper = useElementComponentWrapper({
    element,
    component: ContainerComponent,
  });

  return (
    <Wrapper {...containerProps} ref={rootRef}>
      {group.tabs.map((tab, index) => (
        <TabBarTab
          key={`${group.id}:${tab.id}:${index}`}
          groupId={group.id}
          tab={tab}
          active={group.activeTabId === tab.id}
          dragging={draggingTabId === tab.id}
          onClickTab={onClickTab}
          onStartDrag={onStartDrag}
          tabComponent={TabComponent}
          tabElement={tabElement}
        />
      ))}
      <span style={spacerStyle} />
    </Wrapper>
  );
};
