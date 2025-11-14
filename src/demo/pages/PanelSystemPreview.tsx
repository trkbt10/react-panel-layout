/**
 * @file PanelSystem Preview (single component per page)
 */
import * as React from "react";
import { PanelSystem, buildInitialState } from "../../index";
import type { TabDefinition } from "../../index";
import { createPanelView } from "../utils/createPanelView";
import { ChromeTabBar } from "../components/ChromeTabBar";
import { VSCodeTabBar } from "../components/VSCodeTabBar";
import { GitHubTabBar } from "../components/GitHubTabBar";
import { DemoTabbarConfigProvider, type AddButtonPlacement } from "../contexts/TabbarDemoConfig";

type TabStyle = "raised" | "chrome" | "vscode" | "github";

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

// View切替（tabStyle）で見た目だけ変える。TabBarロジックは共有。

export const PanelSystemPreview: React.FC = () => {
  const [tabStyle, setTabStyle] = React.useState<TabStyle>("raised");
  const [addPlacement, setAddPlacement] = React.useState<AddButtonPlacement>("trailing");
  const [useCustomButtons, setUseCustomButtons] = React.useState(false);
  const tabs = React.useMemo(() => makeTabs(), []);
  const initialState = React.useMemo(() => buildInitialState(tabs), [tabs]);
  const createGroupId = useIdFactory();
  const createPanelId = usePanelIdFactory();
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

  const AddButton = React.useMemo(() => {
    if (!useCustomButtons) {
      return undefined;
    }
    const Comp: React.FC<{ onClick: () => void; ariaLabel?: string; className?: string }> = ({ onClick, ariaLabel, className }) => (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel ?? "Add tab"}
        className={className}
        style={{ background: "#007acc", color: "#fff", border: "none", borderRadius: 4 }}
      >
        +
      </button>
    );
    return Comp;
  }, [useCustomButtons]);

  const CloseButton = React.useMemo(() => {
    if (!useCustomButtons) {
      return undefined;
    }
    const Comp: React.FC<{ onClick: (e: React.MouseEvent) => void; ariaLabel?: string; className?: string }> = ({ onClick, ariaLabel, className }) => (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel ?? "Close tab"}
        className={className}
        style={{ background: "transparent", color: "#d00", border: "none", fontWeight: 700 }}
      >
        ×
      </button>
    );
    return Comp;
  }, [useCustomButtons]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px", borderBottom: "1px solid #ccc", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
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
        <div style={{ marginLeft: 16, display: "inline-flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontWeight: 600 }}>Add Button Placement:</label>
          <select value={addPlacement} onChange={(e) => setAddPlacement(e.target.value as AddButtonPlacement)}>
            <option value="trailing">Trailing (right edge)</option>
            <option value="after-active">After Active Tab</option>
          </select>
        </div>
        <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={useCustomButtons} onChange={(e) => setUseCustomButtons(e.target.checked)} />
          Use custom styled +/×
        </label>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <DemoTabbarConfigProvider value={{ addPlacement, AddButton, CloseButton }}>
          <PanelSystem
            initialState={initialState}
            createGroupId={createGroupId}
            createPanelId={createPanelId}
            layoutMode="grid"
            gridTracksInteractive={false}
            dragThresholdPx={6}
            style={{ width: "100%", height: "100%" }}
            view={View}
          />
        </DemoTabbarConfigProvider>
      </div>
    </div>
  );
};
