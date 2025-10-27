/**
 * @file Demo page entry point with React Router
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router";

function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>React App Demo</h1>
      <nav style={{ marginTop: "1rem" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>
          Home
        </Link>
        <Link to="/about">About</Link>
      </nav>
      <div style={{ marginTop: "2rem" }}>
        <h2>Welcome to the Demo Page</h2>
        <p>This is a minimal React Router setup for demonstration purposes.</p>
      </div>
    </div>
  );
}

function About() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>React App Demo</h1>
      <nav style={{ marginTop: "1rem" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>
          Home
        </Link>
        <Link to="/about">About</Link>
      </nav>
      <div style={{ marginTop: "2rem" }}>
        <h2>About This Demo</h2>
        <p>This demo showcases the library built with Vite.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
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
