/**
 * @file Demo page entry point with React Router
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { Layout } from "./Layout";
import { PanelLayoutDemo } from "./PanelLayoutDemo";
import { PanelLayoutPreview } from "./pages/PanelLayout";
import { FloatingPanelFramePreview } from "./pages/FloatingPanelFrame";
import { HorizontalDividerPreview } from "./pages/HorizontalDivider";
import { ResizeHandlePreview } from "./pages/ResizeHandle";
import "./demo.css";

function Home() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>React Panel Layout Library</h1>
      <div style={{ marginTop: "2rem" }}>
        <h2>Welcome to the Demo Page</h2>
        <p>This library provides a flexible panel layout system for React applications.</p>
        <h3>Features:</h3>
        <ul>
          <li>Grid-based panel layouts with CSS Grid</li>
          <li>Resizable panels with min/max constraints</li>
          <li>Drawer components for mobile-friendly slide-in panels</li>
          <li>Floating panels and overlays</li>
          <li>TypeScript support</li>
        </ul>

        <p style={{ marginTop: "2rem", padding: "1rem", background: "#e8f5e9", borderRadius: "8px", borderLeft: "4px solid #4caf50" }}>
          👈 Use the sidebar navigation to explore different components and demos.
        </p>
      </div>
    </div>
  );
}

function About() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>About</h1>
      <div style={{ marginTop: "2rem" }}>
        <h2>About This Demo</h2>
        <p>
          This demo showcases the React Panel Layout library, a flexible and type-safe panel system for building
          complex UI layouts.
        </p>
        <h3>Components:</h3>
        <ul>
          <li>
            <strong>GridLayout</strong> - Main layout component using CSS Grid
          </li>
          <li>
            <strong>Drawer</strong> - Mobile-friendly slide-in panels
          </li>
          <li>
            <strong>FloatingPanelFrame</strong> - Floating panel components
          </li>
          <li>
            <strong>ResizeHandle</strong> - Interactive resize handles
          </li>
          <li>
            <strong>HorizontalDivider</strong> - Horizontal panel divider with resize functionality
          </li>
          <li>
            <strong>ContextMenuOverlay</strong> - Context menu overlay system
          </li>
        </ul>
        <h3 style={{ marginTop: "2rem" }}>Layout System</h3>
        <p>
          This demo application itself uses the GridLayout component to create the sidebar and main content area layout.
          The sidebar is resizable - try dragging the edge to resize it!
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="panel-demo" element={<PanelLayoutDemo />} />
          <Route path="components/panel-layout" element={<PanelLayoutPreview />} />
          <Route path="components/floating-panel-frame" element={<FloatingPanelFramePreview />} />
          <Route path="components/horizontal-divider" element={<HorizontalDividerPreview />} />
          <Route path="components/resize-handle" element={<ResizeHandlePreview />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
