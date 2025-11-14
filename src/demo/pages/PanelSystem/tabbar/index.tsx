/**
 * @file PanelSystem - TabBar only page
 */
import * as React from "react";
import type { GroupModel, GroupId, PanelId } from "../../../../modules/panels/state/types";
import { TabBar } from "../../../../components/tabs/TabBar";
import { InteractionsProvider } from "../../../../modules/panels/interactions/InteractionsContext";
import { DomRegistryProvider } from "../../../../modules/panels/dom/DomRegistry";
import { DemoPage } from "../../components";

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

  return (
    <DemoPage title="PanelSystem / TabBar" padding="1.5rem" maxWidth={960}>
      <div ref={containerRef} style={{ border: "1px solid #333", borderRadius: 6, background: "#111", padding: 8 }}>
        <DomRegistryProvider>
          <InteractionsProvider
            containerRef={containerRef}
            dragThresholdPx={6}
            onCommitContentDrop={() => {}}
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
              <TabBar group={group} onClickTab={onClickTab} onAddTab={handleAddTab} onCloseTab={handleCloseTab} />
            </InteractionsProvider>
          </DomRegistryProvider>
      </div>
    </DemoPage>
  );
};

export default Page;
