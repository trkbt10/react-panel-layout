/**
 * @file SplitDemoLayout - Responsive layout with left code / right preview
 * Uses GridLayout for desktop (side-by-side) and drawer for compact viewports
 */
import * as React from "react";
import { GridLayout } from "../../../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../../../types";
import { CodePanel } from "./CodePanel";
import styles from "./SplitDemoLayout.module.css";

const COMPACT_BREAKPOINT = 900;

export type SplitDemoLayoutProps = {
  /** Source code to display */
  code: string;
  /** Title for the code panel */
  codeTitle?: string;
  /** Preview content */
  children: React.ReactNode;
  /** Minimum height for the preview area */
  previewMinHeight?: number | string;
};

/**
 * SplitDemoLayout component
 * - Desktop: Left code panel, right preview (side-by-side)
 * - Compact: Preview only, with bottom drawer for code
 */
export const SplitDemoLayout: React.FC<SplitDemoLayoutProps> = ({
  code,
  codeTitle = "Source Code",
  children,
  previewMinHeight = 400,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(0);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Track container width for responsive behavior
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const node = containerRef.current;
    if (!node) return;

    const updateWidth = () => {
      const rect = node.getBoundingClientRect();
      setContainerWidth(Math.round(rect.width));
    };

    updateWidth();

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateWidth) : null;

    if (observer) {
      observer.observe(node);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const isCompact = containerWidth > 0 && containerWidth < COMPACT_BREAKPOINT;

  // Desktop config: side-by-side layout
  const desktopConfig = React.useMemo<PanelLayoutConfig>(
    () => ({
      areas: [["code", "preview"]],
      rows: [{ size: "1fr" }],
      columns: [
        { size: "minmax(320px, 420px)", resizable: true, minSize: 280, maxSize: 600 },
        { size: "1fr" },
      ],
      gap: "0",
    }),
    [],
  );

  // Compact config: preview only (code in drawer)
  const compactConfig = React.useMemo<PanelLayoutConfig>(
    () => ({
      areas: [["preview"]],
      rows: [{ size: "1fr" }],
      columns: [{ size: "1fr" }],
      gap: "0",
    }),
    [],
  );

  const previewMinHeightValue =
    typeof previewMinHeight === "number" ? `${previewMinHeight}px` : previewMinHeight;

  const desktopLayers = React.useMemo<LayerDefinition[]>(
    () => [
      {
        id: "code",
        gridArea: "code",
        component: (
          <div className={styles.codeWrapper}>
            <CodePanel code={code} title={codeTitle} />
          </div>
        ),
      },
      {
        id: "preview",
        gridArea: "preview",
        component: (
          <div className={styles.previewWrapper} style={{ minHeight: previewMinHeightValue }}>
            {children}
          </div>
        ),
      },
    ],
    [code, codeTitle, children, previewMinHeightValue],
  );

  const compactLayers = React.useMemo<LayerDefinition[]>(
    () => [
      {
        id: "preview",
        gridArea: "preview",
        component: (
          <div className={styles.previewWrapper} style={{ minHeight: previewMinHeightValue }}>
            {children}
          </div>
        ),
      },
      {
        id: "code-drawer",
        component: (
          <div className={styles.drawerContent}>
            <CodePanel code={code} title={codeTitle} showHeader={true} />
          </div>
        ),
        drawer: {
          open: drawerOpen,
          onStateChange: setDrawerOpen,
          dismissible: true,
          chrome: false,
          inline: true,
          anchor: "bottom",
          transitionMode: "css",
          transitionDuration: "250ms",
          transitionEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
          ariaLabel: "Source Code",
        },
        position: { bottom: 0, left: 0 },
        width: "100%",
        height: "60%",
        zIndex: 100,
      },
    ],
    [code, codeTitle, children, previewMinHeightValue, drawerOpen],
  );

  const config = isCompact ? compactConfig : desktopConfig;
  const layers = isCompact ? compactLayers : desktopLayers;

  return (
    <div className={styles.container} ref={containerRef}>
      <GridLayout config={config} layers={layers} />

      {/* Floating button to open code drawer in compact mode */}
      {isCompact && !drawerOpen && (
        <button
          type="button"
          className={styles.codeToggle}
          onClick={() => setDrawerOpen(true)}
          aria-label="Show source code"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Code</span>
        </button>
      )}

      {/* Close button inside drawer */}
      {isCompact && drawerOpen && (
        <button
          type="button"
          className={styles.drawerClose}
          onClick={() => setDrawerOpen(false)}
          aria-label="Close code panel"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};
