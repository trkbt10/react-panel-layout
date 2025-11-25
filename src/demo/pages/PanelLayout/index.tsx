/**
 * @file Panel Layout component preview page
 */
import * as React from "react";
import { Section, Story } from "../../components/Story";
import { CodePreview } from "../../components/CodePreview";
import { IDELayout, code as ideLayoutCode } from "./IDELayout";
import { SimpleGrid, code as simpleGridCode } from "./SimpleGrid";
import { DashboardLayout, code as dashboardLayoutCode } from "./DashboardLayout";
import { DraggableOverlays, code as draggableOverlaysCode } from "./DraggableOverlays";
import { DrawerMenuLayout, code as drawerMenuCode } from "../Drawer/DrawerMenuLayout";
import { DrawerBasics, code as drawerBasicsCode } from "../Drawer/DrawerBasics";
import { DemoPage } from "../components";

export const PanelLayoutPreview: React.FC = () => {
  return (
    <DemoPage title="Panel Layout System" padding="2rem">
      <Section title="Simple Grid Layout">
        <Story title="2x2 Grid" description="Basic grid layout with equal-sized cells">
          <div style={{ width: "100%", height: "400px" }}>
            <SimpleGrid />
          </div>
        </Story>
        <CodePreview code={simpleGridCode} title="Simple Grid Code" />
      </Section>

      <Section title="IDE-Style Layout">
        <Story
          title="IDE Layout with Resizable Panels"
          description="Complex layout with toolbar, sidebar, canvas, inspector, and status bar. Includes draggable floating panel."
        >
          <div style={{ width: "100%", height: "600px" }}>
            <IDELayout />
          </div>
        </Story>
        <CodePreview code={ideLayoutCode} title="IDE Layout Code" />
      </Section>

      <Section title="Dashboard Layout">
        <Story
          title="Dashboard with Stats and Charts"
          description="Dashboard-style layout with header, stat cards, charts, and activity feed"
        >
          <div style={{ width: "100%", height: "600px" }}>
            <DashboardLayout />
          </div>
        </Story>
        <CodePreview code={dashboardLayoutCode} title="Dashboard Layout Code" />
      </Section>

      <Section title="Drawer Basics">
        <Story
          title="Default drawer styling"
          description="Shows the built-in drawer chrome and header; click the button to open the left-anchored drawer."
        >
          <div style={{ width: "100%", height: "520px" }}>
            <DrawerBasics />
          </div>
        </Story>
        <CodePreview code={drawerBasicsCode} title="Drawer Basics Code" />
      </Section>

      <Section title="Drawer Menu Layout">
        <Story
          title="Workspace + Drawer"
          description="A desktop workspace with a slide-in navigation drawer controlled via DrawerLayers."
        >
          <div style={{ width: "100%", height: "640px" }}>
            <DrawerMenuLayout />
          </div>
        </Story>
        <CodePreview code={drawerMenuCode} title="Drawer Menu Code" />
      </Section>

      <Section title="Draggable Overlays">
        <Story
          title="Floating Draggable Panels"
          description="Canvas with multiple draggable floating panels for tools, colors, and settings"
        >
          <div style={{ width: "100%", height: "600px" }}>
            <DraggableOverlays />
          </div>
        </Story>
        <CodePreview code={draggableOverlaysCode} title="Draggable Overlays Code" />
      </Section>
    </DemoPage>
  );
};
