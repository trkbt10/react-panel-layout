/**
 * @file Basic FloatingPanelFrame sample
 */
import * as React from "react";
import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelContent,
} from "../../../modules/paneling/FloatingPanelFrame";

export const BasicPanel = () => (
  <FloatingPanelFrame style={{ width: "400px", maxWidth: "100%" }}>
    <FloatingPanelHeader>
      <FloatingPanelTitle>Panel Title</FloatingPanelTitle>
    </FloatingPanelHeader>
    <FloatingPanelContent>
      <p>This is the panel content. You can put any React components here.</p>
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
