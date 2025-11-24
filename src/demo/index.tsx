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

import { DemoButton } from "./components/ui/DemoButton";
import { DemoCard } from "./components/ui/DemoCard";

function Home() {
  return (
    <div
      style={{
        minHeight: "100%",
        background: "var(--rpl-demo-gradient-hero)",
        padding: "var(--rpl-demo-space-xxl) var(--rpl-demo-space-lg)",
        fontFamily: "var(--rpl-demo-font-family)",
        color: "var(--rpl-demo-text-primary)",
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          textAlign: "center",
          marginBottom: "var(--rpl-demo-space-xxl)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "400px",
            background: "var(--rpl-demo-gradient-glow)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: "20px",
              background: "rgba(0,0,0,0.05)",
              backdropFilter: "blur(10px)",
              fontSize: "var(--rpl-demo-font-size-sm)",
              fontWeight: 600,
              marginBottom: "var(--rpl-demo-space-lg)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            v1.0 Public Beta
          </div>
          <h1
            style={{
              fontSize: "var(--rpl-demo-font-size-display)",
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginBottom: "var(--rpl-demo-space-lg)",
              background: "var(--rpl-demo-gradient-text)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            The Ultimate Panel Layout
            <br />
            for React Applications.
          </h1>
          <p
            style={{
              fontSize: "var(--rpl-demo-font-size-lg)",
              lineHeight: 1.5,
              color: "var(--rpl-demo-text-secondary)",
              maxWidth: "640px",
              margin: "0 auto var(--rpl-demo-space-xl)",
            }}
          >
            Build complex, resizable, and drag-and-drop interfaces with ease.
            Powered by CSS Grid and designed for performance.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <DemoButton variant="primary" size="lg">
              Get Started
            </DemoButton>
            <DemoButton variant="secondary" size="lg">
              View Documentation
            </DemoButton>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(2, minmax(240px, auto))",
          gap: "var(--rpl-demo-space-lg)",
        }}
      >
        {/* Card 1: Grid System (Large) */}
        <DemoCard
          hoverEffect
          style={{
            gridColumn: "span 2",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle at 100% 0%, rgba(0,113,227,0.08) 0%, transparent 70%)",
            }}
          />
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Grid System</h3>
            <p style={{ fontSize: "16px", color: "var(--rpl-demo-text-secondary)", maxWidth: "80%" }}>
              Leverage the full power of CSS Grid for pixel-perfect layouts that adapt to any screen size.
            </p>
          </div>
          <div
            style={{
              marginTop: "24px",
              height: "120px",
              background: "rgba(0,0,0,0.03)",
              borderRadius: "var(--rpl-demo-radius-md)",
              border: "1px dashed rgba(0,0,0,0.1)",
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "8px",
              padding: "8px",
            }}
          >
            <div style={{ background: "rgba(0,113,227,0.1)", borderRadius: "4px" }} />
            <div style={{ background: "rgba(0,113,227,0.05)", borderRadius: "4px" }} />
          </div>
        </DemoCard>

        {/* Card 2: Interactive */}
        <DemoCard
          hoverEffect
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👆</div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Interactive</h3>
          <p style={{ fontSize: "14px", color: "var(--rpl-demo-text-secondary)" }}>
            Native-like drag and drop with smooth physics.
          </p>
        </DemoCard>

        {/* Card 3: Performance */}
        <DemoCard
          hoverEffect
          style={{
            background: "#1d1d1f",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Zero Lag</h3>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
            Optimized for 60fps rendering even with complex layouts.
          </p>
        </DemoCard>

        {/* Card 4: Customizable (Wide) */}
        <DemoCard
          hoverEffect
          style={{
            gridColumn: "span 2",
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Fully Customizable</h3>
            <p style={{ fontSize: "16px", color: "var(--rpl-demo-text-secondary)" }}>
              Style every component to match your brand. From resize handles to drop indicators.
            </p>
          </div>
          <div
            style={{
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, #FF2D55 0%, #FF375F 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "24px",
              boxShadow: "0 10px 20px rgba(255, 45, 85, 0.3)",
            }}
          >
            Aa
          </div>
        </DemoCard>
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
