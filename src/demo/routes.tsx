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

import DR_Basics from "./pages/Drawer/basics";
import DR_Menu from "./pages/Drawer/menu";
import DR_Animations from "./pages/Drawer/animations";

import DL_Modal from "./pages/Dialog/modal";
import DL_Alerts from "./pages/Dialog/alerts";

import PS_Preview from "./pages/PanelSystem/preview";
import PS_Tabbar from "./pages/PanelSystem/tabbar";
import { ResizableFloatingPanelsPreview } from "./pages/FloatingPanelFrame/ResizableFloatingPanelsPreview";
import RL_AdaptiveWorkspace from "./pages/ResponsiveLayout/adaptive-workspace";

import PV_Basics from "./pages/Pivot/basics";
import PV_Tabs from "./pages/Pivot/tabs";
import PV_Sidebar from "./pages/Pivot/sidebar";
import PV_Transitions from "./pages/Pivot/transitions";
import PV_Swipe from "./pages/Pivot/swipe";
import PV_SwipeDebug from "./pages/Pivot/swipe-debug";
import PV_SwipeTabs from "./pages/Pivot/swipe-tabs";

import ST_Basics from "./pages/Stack/basics";
import ST_Tablet from "./pages/Stack/tablet";

import SH_Basics from "./pages/StickyHeader/basics";

import { FiGrid, FiLayers, FiColumns, FiMaximize2, FiBox, FiCpu, FiSmartphone, FiSidebar, FiNavigation, FiImage, FiMessageSquare } from "react-icons/fi";

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
    id: "drawer",
    label: "Drawer",
    icon: <FiSidebar />,
    base: "/components/drawer",
    pages: [
      { id: "basics", label: "Basics", path: "basics", element: <DR_Basics /> },
      { id: "menu", label: "Menu", path: "menu", element: <DR_Menu /> },
      { id: "animations", label: "Animations", path: "animations", element: <DR_Animations /> },
    ],
  },
  {
    id: "dialog",
    label: "Dialog",
    icon: <FiMessageSquare />,
    base: "/components/dialog",
    pages: [
      { id: "modal", label: "Modal", path: "modal", element: <DL_Modal /> },
      { id: "alerts", label: "Alert / Confirm / Prompt", path: "alerts", element: <DL_Alerts /> },
    ],
  },
  {
    id: "responsive-layout",
    label: "Responsive Layout",
    icon: <FiSmartphone />,
    base: "/components/responsive-layout",
    pages: [
      {
        id: "adaptive-workspace",
        label: "Adaptive Workspace",
        path: "adaptive-workspace",
        element: <RL_AdaptiveWorkspace />,
      },
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
  {
    id: "pivot",
    label: "Pivot",
    icon: <FiNavigation />,
    base: "/components/pivot",
    pages: [
      { id: "basics", label: "Basics", path: "basics", element: <PV_Basics /> },
      { id: "tabs", label: "Tab Navigation", path: "tabs", element: <PV_Tabs /> },
      { id: "sidebar", label: "Sidebar Navigation", path: "sidebar", element: <PV_Sidebar /> },
      { id: "transitions", label: "Transitions", path: "transitions", element: <PV_Transitions /> },
      { id: "swipe", label: "Swipe Navigation", path: "swipe", element: <PV_Swipe /> },
      { id: "swipe-tabs", label: "Swipe Tabs", path: "swipe-tabs", element: <PV_SwipeTabs /> },
      { id: "swipe-debug", label: "Swipe Debug (iOS)", path: "swipe-debug", element: <PV_SwipeDebug /> },
    ],
  },
  {
    id: "stack",
    label: "Stack",
    icon: <FiLayers />,
    base: "/components/stack",
    pages: [
      { id: "basics", label: "Basics", path: "basics", element: <ST_Basics /> },
      { id: "tablet", label: "Tablet Layout", path: "tablet", element: <ST_Tablet /> },
    ],
  },
  {
    id: "sticky-header",
    label: "StickyHeader",
    icon: <FiImage />,
    base: "/components/sticky-header",
    pages: [
      { id: "basics", label: "Basics", path: "basics", element: <SH_Basics /> },
    ],
  },
];
