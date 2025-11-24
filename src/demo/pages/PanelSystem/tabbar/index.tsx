/**
 * @file PanelSystem - TabBar only page
 */
import * as React from "react";
import type { GroupModel, GroupId, PanelId, TabBarRenderProps } from "../../../../modules/panels/state/types";
import { InteractionsProvider } from "../../../../modules/panels/interactions/InteractionsContext";
import { DomRegistryProvider } from "../../../../modules/panels/dom/DomRegistry";
import { DemoPage } from "../../components";
import { ChromeTabBar, VSCodeTabBar, GitHubTabBar } from "../../../components/tab-styles";
import {
  DemoTabbarConfigProvider,
  useTabbarConfigState,
  TabbarConfigControls,
  type TabStyle,
} from "../../../contexts/TabbarDemoConfig";

const tabBarMap: Record<TabStyle, React.ComponentType<TabBarRenderProps>> = {
  chrome: ChromeTabBar,
  vscode: VSCodeTabBar,
  github: GitHubTabBar,
};

const makeGroup = (id: GroupId): GroupModel => {
  const tabs = [
    { id: "welcome", title: "Welcome", render: () => "Welcome" },
    { id: "explorer", title: "Explorer", render: () => "Explorer" },
    { id: "preview", title: "Preview", render: () => "Preview" },
  ];
  const tabIds = tabs.map((t) => t.id);
  return { id, activeTabId: "welcome", tabs, tabIds } as GroupModel;
};

const Page: React.FC = () => {
  const config = useTabbarConfigState();
  const [group, setGroup] = React.useState<GroupModel>(() => makeGroup("g_demo"));
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const nextId = React.useRef<number>(1);

  const onClickTab = (tabId: PanelId): void => {
    setGroup((prev) => ({ ...prev, activeTabId: tabId }));
  };

  const handleAddTab = (groupId: GroupId): void => {
    if (groupId !== group.id) {
      return;
    }
    const id = `new-${nextId.current++}`;
    const tab = { id, title: `New ${id}`, render: () => `Tab ${id}` };
    setGroup((prev) => {
      const tabs = prev.tabs.concat([tab]);
      const tabIds = tabs.map((t) => t.id);
      return { ...prev, tabs, tabIds, activeTabId: id } as GroupModel;
    });
  };

  const handleCloseTab = (groupId: GroupId, tabId: PanelId): void => {
    if (groupId !== group.id) {
      return;
    }
    setGroup((prev) => {
      const tabs = prev.tabs.filter((t) => t.id !== tabId);
      const tabIds = tabs.map((t) => t.id);
      const activeTabId = prev.activeTabId === tabId ? (tabIds[0] ?? null) : prev.activeTabId;
      return { ...prev, tabs, tabIds, activeTabId } as GroupModel;
    });
  };

  const TabBarComp = tabBarMap[config.tabStyle];

  return (
    <DemoPage title="PanelSystem / TabBar" padding="var(--rpl-demo-space-lg)" maxWidth={960}>
      <TabbarConfigControls
        tabStyle={config.tabStyle}
        setTabStyle={config.setTabStyle}
        addPlacement={config.addPlacement}
        setAddPlacement={config.setAddPlacement}
        doubleClickToAdd={config.doubleClickToAdd}
        setDoubleClickToAdd={config.setDoubleClickToAdd}
        useCustomButtons={config.useCustomButtons}
        setUseCustomButtons={config.setUseCustomButtons}
      />
      <div
        ref={containerRef}
        style={{
          border: "1px solid var(--rpl-demo-sidebar-border)",
          borderRadius: "var(--rpl-demo-radius-lg)",
          background: "#fff",
          padding: "var(--rpl-demo-space-md)",
          marginTop: "var(--rpl-demo-space-lg)",
          boxShadow: "var(--rpl-demo-shadow-md)",
        }}
      >
        <DemoTabbarConfigProvider value={config.configValue}>
          <DomRegistryProvider>
            <InteractionsProvider
              containerRef={containerRef}
              dragThresholdPx={6}
              onCommitContentDrop={() => { }}
              onCommitTabDrop={({ fromGroupId, tabId, targetGroupId, targetIndex }) => {
                if (fromGroupId !== targetGroupId) {
                  return;
                }
                setGroup((prev) => {
                  const currentIndex = prev.tabs.findIndex((t) => t.id === tabId);
                  if (currentIndex === -1) {
                    return prev;
                  }
                  const bounded = Math.max(0, Math.min(targetIndex, prev.tabs.length - 1));
                  if (bounded === currentIndex) {
                    return prev;
                  }
                  const tabs = prev.tabs.slice();
                  const [moved] = tabs.splice(currentIndex, 1);
                  tabs.splice(bounded, 0, moved);
                  const tabIds = tabs.map((t) => t.id);
                  return { ...prev, tabs, tabIds } as GroupModel;
                });
              }}
            >
              <TabBarComp group={group} onClickTab={onClickTab} onAddTab={handleAddTab} onCloseTab={handleCloseTab} doubleClickToAdd={config.doubleClickToAdd} />
            </InteractionsProvider>
          </DomRegistryProvider>
        </DemoTabbarConfigProvider>
      </div>
    </DemoPage>
  );
};

export default Page;
