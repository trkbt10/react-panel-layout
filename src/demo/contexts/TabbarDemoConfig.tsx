/**
 * @file Demo-only context to inject TabBar add/close button components and placement.
 */
import * as React from "react";

export type TabStyle = "chrome" | "vscode" | "github";

export type AddButtonPlacement = "trailing" | "after-active" | "after-tabs";

export type DemoTabbarConfig = {
  tabStyle: TabStyle;
  addPlacement: AddButtonPlacement;
  AddButton?: React.ComponentType<{ onClick: () => void; ariaLabel?: string; className?: string }>;
  CloseButton?: React.ComponentType<{ onClick: (e: React.MouseEvent) => void; ariaLabel?: string; className?: string }>;
};

const defaultConfig: DemoTabbarConfig = {
  tabStyle: "vscode",
  addPlacement: "trailing",
};

const Ctx = React.createContext<DemoTabbarConfig>(defaultConfig);

export const DemoTabbarConfigProvider: React.FC<React.PropsWithChildren<{ value: DemoTabbarConfig }>> = ({ value, children }) => {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useDemoTabbarConfig = (): DemoTabbarConfig => React.useContext(Ctx);

/** Shared hook for tab style configuration state */
export const useTabbarConfigState = (): {
  tabStyle: TabStyle;
  setTabStyle: React.Dispatch<React.SetStateAction<TabStyle>>;
  addPlacement: AddButtonPlacement;
  setAddPlacement: React.Dispatch<React.SetStateAction<AddButtonPlacement>>;
  doubleClickToAdd: boolean;
  setDoubleClickToAdd: React.Dispatch<React.SetStateAction<boolean>>;
  useCustomButtons: boolean;
  setUseCustomButtons: React.Dispatch<React.SetStateAction<boolean>>;
  AddButton: React.ComponentType<{ onClick: () => void; ariaLabel?: string; className?: string }> | undefined;
  CloseButton: React.ComponentType<{ onClick: (e: React.MouseEvent) => void; ariaLabel?: string; className?: string }> | undefined;
  configValue: DemoTabbarConfig;
} => {
  const [tabStyle, setTabStyle] = React.useState<TabStyle>("vscode");
  const [addPlacement, setAddPlacement] = React.useState<AddButtonPlacement>("trailing");
  const [doubleClickToAdd, setDoubleClickToAdd] = React.useState(true);
  const [useCustomButtons, setUseCustomButtons] = React.useState(false);

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

  const configValue = React.useMemo<DemoTabbarConfig>(
    () => ({ tabStyle, addPlacement, AddButton, CloseButton }),
    [tabStyle, addPlacement, AddButton, CloseButton],
  );

  return {
    tabStyle,
    setTabStyle,
    addPlacement,
    setAddPlacement,
    doubleClickToAdd,
    setDoubleClickToAdd,
    useCustomButtons,
    setUseCustomButtons,
    AddButton,
    CloseButton,
    configValue,
  };
};


export type TabbarConfigControlsProps = {
  tabStyle: TabStyle;
  setTabStyle: (style: TabStyle) => void;
  addPlacement: AddButtonPlacement;
  setAddPlacement: (placement: AddButtonPlacement) => void;
  doubleClickToAdd: boolean;
  setDoubleClickToAdd: (enabled: boolean) => void;
  useCustomButtons: boolean;
  setUseCustomButtons: (use: boolean) => void;
};

import { DemoButton } from "../components/ui/DemoButton";

/** Shared UI controls for tabbar configuration */
export const TabbarConfigControls: React.FC<TabbarConfigControlsProps> = ({
  tabStyle,
  setTabStyle,
  addPlacement,
  setAddPlacement,
  doubleClickToAdd,
  setDoubleClickToAdd,
  useCustomButtons,
  setUseCustomButtons,
}) => (
  <div
    style={{
      padding: "var(--rpl-demo-space-md)",
      borderBottom: "1px solid var(--rpl-demo-sidebar-border)",
      display: "flex",
      gap: "var(--rpl-demo-space-sm)",
      alignItems: "center",
      flexWrap: "wrap",
      background: "#fff",
    }}
  >
    <label style={{ fontWeight: 600, marginRight: "var(--rpl-demo-space-sm)", fontSize: "var(--rpl-demo-font-size-sm)" }}>
      Tab Style:
    </label>
    <DemoButton
      variant={tabStyle === "chrome" ? "primary" : "outline"}
      size="sm"
      onClick={() => setTabStyle("chrome")}
    >
      Chrome
    </DemoButton>
    <DemoButton
      variant={tabStyle === "vscode" ? "primary" : "outline"}
      size="sm"
      onClick={() => setTabStyle("vscode")}
    >
      VSCode
    </DemoButton>
    <DemoButton
      variant={tabStyle === "github" ? "primary" : "outline"}
      size="sm"
      onClick={() => setTabStyle("github")}
    >
      GitHub
    </DemoButton>
    <div
      style={{
        marginLeft: "var(--rpl-demo-space-lg)",
        display: "inline-flex",
        gap: "var(--rpl-demo-space-sm)",
        alignItems: "center",
      }}
    >
      <label style={{ fontWeight: 600, fontSize: "var(--rpl-demo-font-size-sm)" }}>Add Button Placement:</label>
      <select
        value={addPlacement}
        onChange={(e) => setAddPlacement(e.target.value as AddButtonPlacement)}
        style={{
          padding: "0.25rem 0.5rem",
          borderRadius: "var(--rpl-demo-radius-md)",
          border: "1px solid var(--rpl-demo-sidebar-border)",
          fontSize: "var(--rpl-demo-font-size-sm)",
          fontFamily: "inherit",
        }}
      >
        <option value="trailing">Trailing (right edge)</option>
        <option value="after-active">After Active Tab</option>
        <option value="after-tabs">After Last Tab</option>
      </select>
    </div>
    <label
      style={{
        display: "inline-flex",
        gap: "var(--rpl-demo-space-xs)",
        alignItems: "center",
        fontSize: "var(--rpl-demo-font-size-sm)",
        marginLeft: "var(--rpl-demo-space-md)",
        cursor: "pointer",
      }}
    >
      <input type="checkbox" checked={doubleClickToAdd} onChange={(e) => setDoubleClickToAdd(e.target.checked)} />
      Double-click to add
    </label>
    <label
      style={{
        display: "inline-flex",
        gap: "var(--rpl-demo-space-xs)",
        alignItems: "center",
        fontSize: "var(--rpl-demo-font-size-sm)",
        marginLeft: "var(--rpl-demo-space-md)",
        cursor: "pointer",
      }}
    >
      <input type="checkbox" checked={useCustomButtons} onChange={(e) => setUseCustomButtons(e.target.checked)} />
      Use custom styled +/×
    </label>
  </div>
);

