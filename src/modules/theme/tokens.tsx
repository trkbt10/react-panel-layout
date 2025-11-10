/**
 * @file Design tokens and theme provider for PanelSystem.
 */
import * as React from "react";

export type PanelDesignTokens = {
  // Colors
  colorTabFg: string;
  colorTabActiveBg: string;
  colorTabbarBg: string;
  colorPanelBorder: string;
  colorPanelBg: string;
  colorPrimary: string; // used by generic resize handles
  colorDropSuggestBorder: string;
  colorDropSuggestBg: string;
  colorTabDragBg: string;
  colorTabDragFg: string;
  colorTabDragBorder: string;
  colorTabDragShadow: string; // CSS box-shadow value
  colorInsertGuide: string;
  colorInsertGuideShadow: string; // CSS box-shadow value

  // Sizes / spaces / radii (strings with units for CSS)
  sizeTabFont: string;
  spaceTabPaddingY: string;
  spaceTabPaddingX: string;
  spaceTabbarGap: string;
  spaceTabbarPaddingY: string;
  spaceTabbarPaddingX: string;
  radiusTab: string;
  radiusSuggest: string;
  sizeSuggestBorder: string;
  sizeGridHandleThickness: string;
  sizeResizeHandleThickness: string;

  // Numeric tokens used in JS computations
  splitHandleThickness: number; // px value used for PanelSplitHandles offset
  dropSuggestPadding: number; // px padding inside content rect

  // z-indexes
  zIndexOverlay: string;
  zIndexTabDragOverlay: string;
};

export const defaultPanelDesignTokens: PanelDesignTokens = {
  colorTabFg: "#d5d7de",
  colorTabActiveBg: "#2b2d35",
  colorTabbarBg: "#1e1f24",
  colorPanelBorder: "rgba(0,0,0,0.3)",
  colorPanelBg: "#0b0b0c",
  colorPrimary: "#2196f3",
  colorDropSuggestBorder: "rgba(90,150,255,0.9)",
  colorDropSuggestBg: "rgba(90,150,255,0.15)",
  colorTabDragBg: "rgba(34, 36, 42, 0.95)",
  colorTabDragFg: "#e9ebf0",
  colorTabDragBorder: "rgba(120,160,255,0.6)",
  colorTabDragShadow: "0 6px 20px rgba(0,0,0,0.35)",
  colorInsertGuide: "rgba(120,160,255,0.95)",
  colorInsertGuideShadow: "0 0 0 2px rgba(120, 160, 255, 0.2)",

  sizeTabFont: "12px",
  spaceTabPaddingY: "4px",
  spaceTabPaddingX: "8px",
  spaceTabbarGap: "6px",
  spaceTabbarPaddingY: "4px",
  spaceTabbarPaddingX: "6px",
  radiusTab: "4px",
  radiusSuggest: "6px",
  sizeSuggestBorder: "2px",
  sizeGridHandleThickness: "4px",
  sizeResizeHandleThickness: "4px",

  splitHandleThickness: 6,
  dropSuggestPadding: 6,

  zIndexOverlay: "9998",
  zIndexTabDragOverlay: "9999",
};

export type PanelThemeProviderProps = React.PropsWithChildren<{
  tokens?: Partial<PanelDesignTokens>;
}>; 

export type PanelThemeContextValue = PanelDesignTokens;

const PanelThemeContext = React.createContext<PanelThemeContextValue | null>(null);

export const usePanelTheme = (): PanelThemeContextValue => {
  const ctx = React.useContext(PanelThemeContext);
  if (!ctx) {
    throw new Error("usePanelTheme must be used within PanelThemeProvider");
  }
  return ctx;
};

type CSSVarStyle = React.CSSProperties & { [key in `--${string}`]?: string };

export const PanelThemeProvider: React.FC<PanelThemeProviderProps> = ({ tokens, children }) => {
  const merged = React.useMemo<PanelDesignTokens>(() => ({ ...defaultPanelDesignTokens, ...(tokens ?? {}) }), [tokens]);
  const styleVars = React.useMemo(() => {
    const s: CSSVarStyle = {};
    s["--rpl-color-tab-fg"] = merged.colorTabFg;
    s["--rpl-color-tab-active-bg"] = merged.colorTabActiveBg;
    s["--rpl-color-tabbar-bg"] = merged.colorTabbarBg;
    s["--rpl-color-panel-border"] = merged.colorPanelBorder;
    s["--rpl-color-panel-bg"] = merged.colorPanelBg;
    s["--rpl-color-primary"] = merged.colorPrimary;
    s["--rpl-color-drop-suggest-border"] = merged.colorDropSuggestBorder;
    s["--rpl-color-drop-suggest-bg"] = merged.colorDropSuggestBg;
    s["--rpl-color-tabdrag-bg"] = merged.colorTabDragBg;
    s["--rpl-color-tabdrag-fg"] = merged.colorTabDragFg;
    s["--rpl-color-tabdrag-border"] = merged.colorTabDragBorder;
    s["--rpl-color-tabdrag-shadow"] = merged.colorTabDragShadow;
    s["--rpl-color-insert-guide"] = merged.colorInsertGuide;
    s["--rpl-color-insert-guide-shadow"] = merged.colorInsertGuideShadow;

    s["--rpl-size-tab-font"] = merged.sizeTabFont;
    s["--rpl-space-tab-padding-y"] = merged.spaceTabPaddingY;
    s["--rpl-space-tab-padding-x"] = merged.spaceTabPaddingX;
    s["--rpl-space-tabbar-gap"] = merged.spaceTabbarGap;
    s["--rpl-space-tabbar-padding-y"] = merged.spaceTabbarPaddingY;
    s["--rpl-space-tabbar-padding-x"] = merged.spaceTabbarPaddingX;
    s["--rpl-radius-tab"] = merged.radiusTab;
    s["--rpl-radius-suggest"] = merged.radiusSuggest;
    s["--rpl-size-suggest-border"] = merged.sizeSuggestBorder;
    s["--rpl-size-grid-handle-thickness"] = merged.sizeGridHandleThickness;
    s["--rpl-size-resize-handle-thickness"] = merged.sizeResizeHandleThickness;

    s["--rpl-z-overlay"] = merged.zIndexOverlay;
    s["--rpl-z-tabdrag-overlay"] = merged.zIndexTabDragOverlay;
    return s;
  }, [merged]);
  return (
    <PanelThemeContext.Provider value={merged}>
      <div style={{ ...styleVars, height: "100%", width: "100%", minHeight: 0, minWidth: 0 }}>
        {children}
      </div>
    </PanelThemeContext.Provider>
  );
};

export const raisedPanelDesignTokens: PanelDesignTokens = {
  ...defaultPanelDesignTokens,
  colorTabbarBg: "#202227",
  colorTabActiveBg: "#2f323a",
  colorPanelBorder: "rgba(255,255,255,0.12)",
  colorPanelBg: "#1a1b20",
};
