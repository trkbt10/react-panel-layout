/**
 * @file PanelSystem Preview (single component per page)
 */
import * as React from "react";
import { PanelSystem, buildPanelInitialState } from "../../index";
import type { VSCodePanelTab } from "../../index";
import { createPanelView } from "../../index";
import { ChromeTabBar } from "../components/ChromeTabBar";
import { VSCodeTabBar } from "../components/VSCodeTabBar";
import { GitHubTabBar } from "../components/GitHubTabBar";

type TabStyle = "raised" | "chrome" | "vscode" | "github";

const makeTabs = (): VSCodePanelTab[] => {
  const mk = (id: string, title: string): VSCodePanelTab => ({ id, title, render: () => React.createElement("div", { style: { padding: 12 } }, `${title} content`) });
  return [mk("welcome", "Welcome"), mk("explorer", "Explorer"), mk("preview", "Preview")];
};

const useIdFactory = (): (() => string) => {
  const counterRef = React.useRef(2);
  return React.useCallback((): string => {
    counterRef.current += 1;
    return `g_${String(counterRef.current)}`;
  }, []);
};

// View切替（tabStyle）で見た目だけ変える。TabBarロジックは共有。

export const PanelSystemPreview: React.FC = () => {
  const [tabStyle, setTabStyle] = React.useState<TabStyle>("raised");
  const tabs = React.useMemo(() => makeTabs(), []);
  const initialState = React.useMemo(() => buildPanelInitialState(tabs), [tabs]);
  const createGroupId = useIdFactory();
  const View = React.useMemo(() => {
    switch (tabStyle) {
      case "chrome":
        return createPanelView(ChromeTabBar);
      case "vscode":
        return createPanelView(VSCodeTabBar);
      case "github":
        return createPanelView(GitHubTabBar);
      case "raised":
      default:
        return createPanelView();
    }
  }, [tabStyle]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px", borderBottom: "1px solid #ccc", display: "flex", gap: "8px", alignItems: "center" }}>
        <label style={{ fontWeight: "bold", marginRight: "8px" }}>Tab Style:</label>
        <button
          onClick={() => setTabStyle("raised")}
          style={{
            padding: "6px 12px",
            background: tabStyle === "raised" ? "#007acc" : "#f0f0f0",
            color: tabStyle === "raised" ? "#fff" : "#000",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Raised
        </button>
        <button
          onClick={() => setTabStyle("chrome")}
          style={{
            padding: "6px 12px",
            background: tabStyle === "chrome" ? "#007acc" : "#f0f0f0",
            color: tabStyle === "chrome" ? "#fff" : "#000",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Chrome
        </button>
        <button
          onClick={() => setTabStyle("vscode")}
          style={{
            padding: "6px 12px",
            background: tabStyle === "vscode" ? "#007acc" : "#f0f0f0",
            color: tabStyle === "vscode" ? "#fff" : "#000",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          VSCode
        </button>
        <button
          onClick={() => setTabStyle("github")}
          style={{
            padding: "6px 12px",
            background: tabStyle === "github" ? "#007acc" : "#f0f0f0",
            color: tabStyle === "github" ? "#fff" : "#000",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          GitHub
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <PanelSystem
          initialState={initialState}
          createGroupId={createGroupId}
          layoutMode="grid"
          gridTracksInteractive={false}
          dragThresholdPx={6}
          style={{ width: "100%", height: "100%" }}
          view={View}
        />
      </div>
    </div>
  );
};
