/**
 * @file Group view rendering for PanelSystem (tabbar + active content).
 */
import * as React from "react";
import type { PanelGroupRenderProps } from "../../modules/panels/state/types";

export type PanelGroupViewProps = PanelGroupRenderProps & {
  /** Custom component for the group container */
  component?: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }>;
  /** Custom element for the group container */
  element?: React.ReactElement;
  /** Custom component for the content container */
  contentComponent?: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }>;
  /** Custom element for the content container */
  contentElement?: React.ReactElement;
};

const groupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
};

const contentStyle: React.CSSProperties = {
  flex: "1 1 auto",
  minWidth: 0,
  minHeight: 0,
  position: "relative",
  overflow: "hidden",
};

function createContentNode(
  contentElement: React.ReactElement | undefined,
  ContentComponent: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }> | undefined,
  contentProps: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> },
  content: React.ReactNode
): React.ReactNode {
  if (contentElement) {
    return React.cloneElement(contentElement, contentProps, content);
  }
  if (ContentComponent) {
    return <ContentComponent {...contentProps}>{content}</ContentComponent>;
  }
  return <div {...contentProps}>{content}</div>;
}

function createGroupNode(
  element: React.ReactElement | undefined,
  GroupComponent: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }> | undefined,
  groupProps: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> },
  groupContent: React.ReactNode
): React.ReactNode {
  if (element) {
    return React.cloneElement(element, groupProps, groupContent);
  }
  if (GroupComponent) {
    return <GroupComponent {...groupProps}>{groupContent}</GroupComponent>;
  }
  return <div {...groupProps}>{groupContent}</div>;
}

const RawPanelGroupView: React.FC<PanelGroupViewProps> = ({
  group,
  tabbar,
  content,
  onContentPointerDown,
  groupRef,
  contentRef,
  component: GroupComponent,
  element,
  contentComponent: ContentComponent,
  contentElement
}) => {
  const groupProps = {
    ref: groupRef,
    style: groupStyle,
    "data-group-id": group.id,
  };

  const contentProps = {
    ref: contentRef,
    style: contentStyle,
    "data-dnd-zone": "content",
    onPointerDown: onContentPointerDown,
  };

  const contentNode = createContentNode(contentElement, ContentComponent, contentProps, content);

  const groupContent = (
    <>
      {tabbar}
      {contentNode}
    </>
  );

  return createGroupNode(element, GroupComponent, groupProps, groupContent);
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
