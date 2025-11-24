/**
 * @file PanelSystem Preview (single component per page)
 */
import * as React from "react";
import { PanelSystem, buildInitialState } from "../../index";
import type { TabDefinition } from "../../index";
import { createPanelView } from "../utils/createPanelView";
import { ChromeTabBar, VSCodeTabBar, GitHubTabBar } from "../components/tab-styles";
import {
  DemoTabbarConfigProvider,
  useTabbarConfigState,
  TabbarConfigControls,
  type TabStyle,
} from "../contexts/TabbarDemoConfig";
import type { TabBarRenderProps } from "../../modules/panels/state/types";

const makeTabs = (): TabDefinition[] => {
  const mk = (id: string, title: string): TabDefinition => ({ id, title, render: () => React.createElement("div", { style: { padding: 12 } }, `${title} content`) });
  return [mk("welcome", "Welcome"), mk("explorer", "Explorer"), mk("preview", "Preview")];
};

const useIdFactory = (): (() => string) => {
  const counterRef = React.useRef(2);
  return React.useCallback((): string => {
    counterRef.current += 1;
    return `g_${String(counterRef.current)}`;
  }, []);
};

const usePanelIdFactory = (): (() => string) => {
  const counterRef = React.useRef(0);
  return React.useCallback((): string => {
    counterRef.current += 1;
    return `p_${String(counterRef.current)}`;
  }, []);
};

const tabBarMap: Record<TabStyle, React.ComponentType<TabBarRenderProps>> = {
  chrome: ChromeTabBar,
  vscode: VSCodeTabBar,
  github: GitHubTabBar,
};

export const PanelSystemPreview: React.FC = () => {
  const config = useTabbarConfigState();
  const tabs = React.useMemo(() => makeTabs(), []);
  const initialState = React.useMemo(() => buildInitialState(tabs), [tabs]);
  const createGroupId = useIdFactory();
  const createPanelId = usePanelIdFactory();
  const View = React.useMemo(() => createPanelView(tabBarMap[config.tabStyle]), [config.tabStyle]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
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
      <div style={{ flex: 1, minHeight: 0 }}>
        <DemoTabbarConfigProvider value={config.configValue}>
          <PanelSystem
            initialState={initialState}
            createGroupId={createGroupId}
            createPanelId={createPanelId}
            layoutMode="grid"
            gridTracksInteractive={false}
            dragThresholdPx={6}
            doubleClickToAdd={config.doubleClickToAdd}
            style={{ width: "100%", height: "100%" }}
            view={View}
          />
        </DemoTabbarConfigProvider>
      </div>
    </div>
  );
};
