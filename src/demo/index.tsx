/**
 * @file Demo page entry point with React Router
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import { Layout } from "./Layout";
import { PanelLayoutDemo } from "./PanelLayoutDemo";
import { demoCategories } from "./routes";
import * as React from "react";
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

function App() {
  const CategoryOutlet: React.FC = () => {
    return <Outlet />;
  };

  // Use Vite's BASE_URL for React Router basename
  // This automatically matches the base path set in vite.config.ts
  const basename = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="panel-demo" element={<PanelLayoutDemo />} />
          {demoCategories.map((cat) => (
            <Route key={cat.id} path={cat.base.slice(1)} element={<CategoryOutlet />}>
              {cat.pages.map((page) => (
                <Route
                  key={page.id}
                  path={page.path}
                  element={<React.Suspense fallback={null}>{page.element}</React.Suspense>}
                />
              ))}
            </Route>
          ))}
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
