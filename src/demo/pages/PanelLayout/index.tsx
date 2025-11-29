/**
 * @file Panel Layout component preview page
 */
import * as React from "react";
import { Section, Story } from "../../components/Story";
import { CodePreview } from "../../components/CodePreview";
import { IDELayout } from "./components/IDELayout";
import IDELayoutSource from "./components/IDELayout.tsx?raw";
import { SimpleGrid } from "./components/SimpleGrid";
import SimpleGridSource from "./components/SimpleGrid.tsx?raw";
import { DashboardLayout } from "./components/DashboardLayout";
import DashboardLayoutSource from "./components/DashboardLayout.tsx?raw";
import { DraggableOverlays } from "./components/DraggableOverlays";
import DraggableOverlaysSource from "./components/DraggableOverlays.tsx?raw";
import { DrawerMenuLayout } from "../Drawer/components/DrawerMenuLayout";
import DrawerMenuLayoutSource from "../Drawer/components/DrawerMenuLayout.tsx?raw";
import { DrawerBasics } from "../Drawer/components/DrawerBasics";
import DrawerBasicsSource from "../Drawer/components/DrawerBasics.tsx?raw";
import { DemoPage } from "../../components/layout";

export const PanelLayoutPreview: React.FC = () => {
  return (
    <DemoPage title="Panel Layout System" padding="2rem">
      <Section title="Simple Grid Layout">
        <Story title="2x2 Grid" description="Basic grid layout with equal-sized cells">
          <div style={{ width: "100%", height: "400px" }}>
            <SimpleGrid />
          </div>
        </Story>
        <CodePreview code={SimpleGridSource} title="SimpleGrid.tsx" />
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
        <CodePreview code={IDELayoutSource} title="IDELayout.tsx" />
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
        <CodePreview code={DashboardLayoutSource} title="DashboardLayout.tsx" />
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
        <CodePreview code={DrawerBasicsSource} title="DrawerBasics.tsx" />
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
        <CodePreview code={DrawerMenuLayoutSource} title="DrawerMenuLayout.tsx" />
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
        <CodePreview code={DraggableOverlaysSource} title="DraggableOverlays.tsx" />
      </Section>
    </DemoPage>
  );
};
