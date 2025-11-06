/**
 * @file PanelSystem Preview (single component per page)
 */
import * as React from "react";
import { PanelSystem, buildPanelInitialState } from "../../index";
import type { VSCodePanelTab } from "../../index";

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

export const PanelSystemPreview: React.FC = () => {
  const tabs = React.useMemo(() => makeTabs(), []);
  const initialState = React.useMemo(() => buildPanelInitialState(tabs), [tabs]);
  const createGroupId = useIdFactory();

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <PanelSystem
        initialState={initialState}
        createGroupId={createGroupId}
        layoutMode="grid"
        gridTracksInteractive={false}
        dragThresholdPx={6}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
