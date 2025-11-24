/**
 * @file Demo route configuration for Sidebar and Router
 */
import * as React from "react";

// Page components (static imports to satisfy lint rules)
import FP_Basic from "./pages/FloatingPanelFrame/basic";
import FP_WithMeta from "./pages/FloatingPanelFrame/with-meta";
import FP_WithControls from "./pages/FloatingPanelFrame/with-controls";
import FP_Complex from "./pages/FloatingPanelFrame/complex";
import FP_Scrollable from "./pages/FloatingPanelFrame/scrollable";

import HD_Simple from "./pages/HorizontalDivider/simple-resizable-panels";
import HD_Rich from "./pages/HorizontalDivider/panels-with-rich-content";
import HD_Three from "./pages/HorizontalDivider/three-panel-layout";

import RH_Vertical from "./pages/ResizeHandle/vertical";
import RH_Horizontal from "./pages/ResizeHandle/horizontal";
import RH_Both from "./pages/ResizeHandle/both-directions";
import RH_Nested from "./pages/ResizeHandle/nested-panels";

import PL_SimpleGrid from "./pages/PanelLayout/simple-grid";
import PL_IDE from "./pages/PanelLayout/ide-layout";
import PL_Dashboard from "./pages/PanelLayout/dashboard";
import PL_Overlays from "./pages/PanelLayout/draggable-overlays";

import PS_Preview from "./pages/PanelSystem/preview";
import PS_Tabbar from "./pages/PanelSystem/tabbar";
import { ResizableFloatingPanelsPreview } from "./pages/ResizableFloatingPanelsPreview";

import { FiGrid, FiLayers, FiColumns, FiMaximize2, FiBox, FiCpu } from "react-icons/fi";

export type DemoPage = {
  id: string;
  label: string;
  path: string; // path relative to the category base
  element: React.ReactNode;
};

export type DemoCategory = {
  id: string;
  label: string;
  icon: React.ReactNode;
  base: string; // base route path
  pages: DemoPage[];
};

export const demoCategories: DemoCategory[] = [
  {
    id: "panel-layout",
    label: "PanelLayout",
    icon: <FiGrid />,
    base: "/components/panel-layout",
    pages: [
      { id: "simple-grid", label: "Simple Grid", path: "simple-grid", element: <PL_SimpleGrid /> },
      { id: "ide-layout", label: "IDE Layout", path: "ide-layout", element: <PL_IDE /> },
      { id: "dashboard", label: "Dashboard", path: "dashboard", element: <PL_Dashboard /> },
      { id: "draggable-overlays", label: "Draggable Overlays", path: "draggable-overlays", element: <PL_Overlays /> },
    ],
  },
  {
    id: "floating-panel-frame",
    label: "FloatingPanelFrame",
    icon: <FiLayers />,
    base: "/components/floating-panel-frame",
    pages: [
      { id: "basic", label: "Basic", path: "basic", element: <FP_Basic /> },
      { id: "with-meta", label: "With Meta", path: "with-meta", element: <FP_WithMeta /> },
      { id: "with-controls", label: "With Controls", path: "with-controls", element: <FP_WithControls /> },
      { id: "complex", label: "Complex", path: "complex", element: <FP_Complex /> },
      { id: "scrollable", label: "Scrollable", path: "scrollable", element: <FP_Scrollable /> },
    ],
  },
  {
    id: "horizontal-divider",
    label: "HorizontalDivider",
    icon: <FiColumns />,
    base: "/components/horizontal-divider",
    pages: [
      { id: "simple", label: "Simple", path: "simple-resizable-panels", element: <HD_Simple /> },
      { id: "rich-content", label: "Rich Content", path: "panels-with-rich-content", element: <HD_Rich /> },
      { id: "three-panel", label: "Three Panel", path: "three-panel-layout", element: <HD_Three /> },
    ],
  },
  {
    id: "resize-handle",
    label: "ResizeHandle",
    icon: <FiMaximize2 />,
    base: "/components/resize-handle",
    pages: [
      { id: "vertical", label: "Vertical", path: "vertical", element: <RH_Vertical /> },
      { id: "horizontal", label: "Horizontal", path: "horizontal", element: <RH_Horizontal /> },
      { id: "both", label: "Both Directions", path: "both-directions", element: <RH_Both /> },
      { id: "nested", label: "Nested Panels", path: "nested-panels", element: <RH_Nested /> },
    ],
  },
  {
    id: "resizable-floating-panels",
    label: "Resizable Floating Panels",
    icon: <FiBox />,
    base: "/components/resizable-floating-panels",
    pages: [
      { id: "edge-resize", label: "Edge Resize", path: "edge-resize", element: <ResizableFloatingPanelsPreview /> },
    ],
  },
  {
    id: "panel-system",
    label: "PanelSystem",
    icon: <FiCpu />,
    base: "/components/panel-system",
    pages: [
      { id: "preview", label: "Preview", path: "preview", element: <PS_Preview /> },
      { id: "tabbar", label: "TabBar", path: "tabbar", element: <PS_Tabbar /> },
    ],
  },
];
