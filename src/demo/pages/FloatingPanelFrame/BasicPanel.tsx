/**
 * @file Basic FloatingPanelFrame sample
 */
import * as React from "react";
import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelContent,
} from "../../../components/paneling/FloatingPanelFrame";

export const BasicPanel = () => (
  <FloatingPanelFrame
    style={{
      width: "100%",
      height: "400px",
      position: "relative",
      backgroundColor: "var(--rpl-demo-bg-secondary)",
      backgroundImage: "radial-gradient(var(--rpl-demo-border-primary) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      border: "1px solid var(--rpl-demo-sidebar-border)",
      borderRadius: "var(--rpl-demo-radius-lg)",
      boxShadow: "var(--rpl-demo-shadow-md)",
      overflow: "hidden",
    }}
  >
    <FloatingPanelHeader>
      <FloatingPanelTitle>Panel Title</FloatingPanelTitle>
    </FloatingPanelHeader>
    <FloatingPanelContent>
      <p style={{ color: "var(--rpl-demo-text-secondary)" }}>This is the panel content. You can put any React components here.</p>
    </FloatingPanelContent>
  </FloatingPanelFrame>
);

export const code = `import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelContent,
} from "./components/panels/FloatingPanelFrame";

export const BasicPanel = () => (
  <FloatingPanelFrame style={{ width: "400px" }}>
    <FloatingPanelHeader>
      <FloatingPanelTitle>Panel Title</FloatingPanelTitle>
    </FloatingPanelHeader>
    <FloatingPanelContent>
      <p>This is the panel content.</p>
    </FloatingPanelContent>
  </FloatingPanelFrame>
);`;
