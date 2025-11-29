/**
 * @file Responsive layout demo that adapts grid templates at a breakpoint
 */
import * as React from "react";
import { GridLayout } from "../../../../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../../../../types";
import styles from "./ResponsiveWorkspace.module.css";
import { DemoCard } from "../../../components/ui/DemoCard";
import { FiClock, FiMonitor, FiRefreshCw, FiSmartphone, FiTrendingUp } from "react-icons/fi";

const BREAKPOINT = 960;

const desktopConfig: PanelLayoutConfig = {
  areas: [
    ["header", "header", "header", "header"],
    ["nav", "content", "content", "insights"],
    ["nav", "content", "content", "insights"],
    ["footer", "footer", "footer", "insights"],
  ],
  rows: [
    { size: "auto" },
    { size: "1fr" },
    { size: "1fr" },
    { size: "auto" },
  ],
  columns: [
    { size: "280px", resizable: true, minSize: 220, maxSize: 360 },
    { size: "1fr" },
    { size: "1fr" },
    { size: "320px", resizable: true, minSize: 260, maxSize: 420 },
  ],
  gap: "12px",
  style: {
    background: "var(--rpl-color-surface-2)",
    border: "1px solid var(--rpl-color-border)",
    borderRadius: "var(--rpl-demo-radius-xl)",
    boxShadow: "var(--rpl-demo-shadow-md)",
    padding: "12px",
  },
};

const compactConfig: PanelLayoutConfig = {
  areas: [
    ["header", "header"],
    ["content", "content"],
    ["insights", "insights"],
    ["nav", "nav"],
    ["footer", "footer"],
  ],
  rows: [
    { size: "auto" },
    { size: "1fr" },
    { size: "auto" },
    { size: "auto" },
    { size: "auto" },
  ],
  columns: [
    { size: "1fr" },
    { size: "1fr" },
  ],
  gap: "12px",
  style: {
    background: "var(--rpl-color-surface-2)",
    border: "1px solid var(--rpl-color-border)",
    borderRadius: "var(--rpl-demo-radius-xl)",
    boxShadow: "var(--rpl-demo-shadow-md)",
    padding: "12px",
  },
};

const statCards = [
  { title: "Active tracks", value: "4", fill: "76%", caption: "Header, nav, content, insights" },
  { title: "Grid columns", value: "4 → 2", fill: "64%", caption: "Columns collapse below 960px" },
  { title: "Resize events", value: "Live", fill: "90%", caption: "Layout recalculates on resize" },
  { title: "Pinned panels", value: "2", fill: "82%", caption: "Nav + insights stay visible" },
] as const;

const timelineItems = [
  { label: "Design handoff", value: "Desktop grid" },
  { label: "QA preview", value: "Tablet ready" },
  { label: "Release", value: "Compact stack" },
] as const;

const insights = [
  { title: "Desktop grid", caption: "Two content tracks with pinned navigation.", icon: <FiMonitor /> },
  { title: "Compact stack", caption: "Panels reorder without remounting.", icon: <FiSmartphone /> },
  { title: "Live recalculation", caption: "GridLayout swaps templates on resize.", icon: <FiRefreshCw /> },
] as const;

const HeaderSection: React.FC<{ isCompact: boolean; viewportWidth: number }> = ({ isCompact, viewportWidth }) => {
  return (
    <DemoCard className={`${styles.card} ${styles.header}`}>
      <div className={styles.headerTop}>
        <div>
          <p className={styles.eyebrow}>Responsive workspace</p>
          <h3 className={styles.heading}>Adaptive content lanes</h3>
          <p className={styles.body}>
            Keeps navigation pinned on desktop and stacks panels after content on mobile without remounting.
          </p>
          <div className={styles.chipRow}>
            <span className={styles.chip}>Breakpoint {BREAKPOINT}px</span>
            <span className={styles.chip}>{isCompact ? "Compact layout" : "Desktop grid"}</span>
            <span className={styles.chip}>Viewport {Math.round(viewportWidth)}px</span>
          </div>
        </div>
        <div className={styles.pulse}>
          <span className={styles.pulseDot} />
          <span>Listening for resize</span>
        </div>
      </div>
    </DemoCard>
  );
};

const NavigationPanel: React.FC<{ isCompact: boolean }> = ({ isCompact }) => {
  return (
    <DemoCard className={`${styles.card} ${styles.sidebar}`}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Navigation</p>
          <h4 className={styles.sectionTitle}>Pinned controls</h4>
          <p className={styles.sectionCaption}>
            Stays on the left on desktop, stacks below content when the viewport is compact.
          </p>
        </div>
        <span className={`${styles.mode} ${isCompact ? styles.compact : styles.desktop}`}>
          {isCompact ? "Stacked" : "Pinned"}
        </span>
      </div>
      <div className={styles.filterGrid}>
        {["Overview", "Goals", "Backlog", "Approvals", "QA"].map((item) => (
          <button key={item} type="button" className={styles.filter}>
            {item}
          </button>
        ))}
      </div>
      <div className={styles.sidebarFooter}>
        <FiClock />
        <span>Panels keep their IDs while the template changes.</span>
      </div>
    </DemoCard>
  );
};

const ContentArea: React.FC = () => {
  return (
    <DemoCard className={`${styles.card} ${styles.content}`}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Workspace</p>
          <h4 className={styles.sectionTitle}>Storyline view</h4>
          <p className={styles.sectionCaption}>
            Primary content stretches across two columns and gracefully collapses on smaller screens.
          </p>
        </div>
        <span className={`${styles.mode} ${styles.desktop}`}>Auto layout</span>
      </div>
      <div className={styles.contentGrid}>
        {statCards.map((stat) => (
          <div key={stat.title} className={styles.contentCard}>
            <div className={styles.contentStat}>
              <span className={styles.statLabel}>{stat.title}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
            <div className={styles.progress}>
              <div className={styles.progressFill} style={{ width: stat.fill }} />
            </div>
            <p className={styles.sectionCaption}>{stat.caption}</p>
          </div>
        ))}
      </div>
      <div className={styles.timeline}>
        {timelineItems.map((item) => (
          <div key={item.label} className={styles.timelineItem}>
            <span className={styles.timelineDot} />
            <span className={styles.timelineLabel}>{item.label}</span>
            <span className={styles.timelineValue}>{item.value}</span>
          </div>
        ))}
      </div>
    </DemoCard>
  );
};

const InsightsPanel: React.FC = () => {
  return (
    <DemoCard className={`${styles.card} ${styles.insights}`}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Insights</p>
          <h4 className={styles.sectionTitle}>Responsive signals</h4>
        </div>
        <FiTrendingUp />
      </div>
      <ul className={styles.insightList}>
        {insights.map((item) => (
          <li key={item.title} className={styles.insightItem}>
            <span className={styles.insightIcon}>{item.icon}</span>
            <div className={styles.insightText}>
              <p className={styles.insightTitle}>{item.title}</p>
              <p className={styles.insightCaption}>{item.caption}</p>
            </div>
          </li>
        ))}
      </ul>
    </DemoCard>
  );
};

const FooterPanel: React.FC<{ isCompact: boolean }> = ({ isCompact }) => {
  return (
    <DemoCard className={`${styles.card} ${styles.footer}`}>
      <div className={styles.footerRow}>
        <div>
          <p className={styles.eyebrow}>Try it now</p>
          <p className={styles.footerTitle}>Resize the preview to cross the breakpoint.</p>
          <p className={styles.sectionCaption}>
            GridLayout swaps between desktop and compact templates while keeping components mounted.
          </p>
        </div>
        <div className={styles.footerMeta}>
          <span className={`${styles.mode} ${isCompact ? styles.compact : styles.desktop}`}>
            {isCompact ? "Compact" : "Desktop"} active
          </span>
          <span className={styles.sectionCaption}>Navigation remains visible in both modes.</span>
        </div>
      </div>
    </DemoCard>
  );
};

const GuidePanel: React.FC<{ breakpoint: number }> = ({ breakpoint }) => {
  return (
    <DemoCard className={`${styles.card} ${styles.framePane}`}>
      <p className={styles.panelTitle}>How to try</p>
      <p className={styles.panelNote}>Drag either resize handle to shrink or grow the viewport.</p>
      <p className={styles.panelNote}>Cross the breakpoint to flip between desktop and compact templates.</p>
      <div className={styles.chipRow}>
        <span className={styles.chip}>Breakpoint {breakpoint}px</span>
        <span className={styles.chip}>Two resizable gutters</span>
      </div>
    </DemoCard>
  );
};

const DetailsPanel: React.FC<{ isCompact: boolean; width: number }> = ({ isCompact, width }) => {
  return (
    <DemoCard className={`${styles.card} ${styles.framePane}`}>
      <p className={styles.panelTitle}>Live state</p>
      <p className={styles.panelNote}>Resize the viewport to flip the grid template without remounting.</p>
      <div className={styles.chipRow}>
        <span className={`${styles.mode} ${isCompact ? styles.compact : styles.desktop}`}>
          {isCompact ? "Compact mode" : "Desktop mode"}
        </span>
        <span className={styles.badge}>Viewport {Math.round(width)}px</span>
      </div>
      <p className={styles.panelNote}>Navigation and insights remain visible in both states.</p>
    </DemoCard>
  );
};

export const ResponsiveWorkspace: React.FC = () => {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = React.useState<number>(0);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const node = viewportRef.current;
    if (!node) {
      return;
    }

    const updateWidth = () => {
      const rect = node.getBoundingClientRect();
      setViewportWidth(Math.round(rect.width));
    };

    updateWidth();
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateWidth) : null;

    if (observer) {
      observer.observe(node);
    }

    window.addEventListener("resize", updateWidth);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const isCompact = viewportWidth > 0 && viewportWidth < BREAKPOINT;

  const layoutConfig = React.useMemo<PanelLayoutConfig>(() => {
    if (isCompact) {
      return compactConfig;
    }
    return desktopConfig;
  }, [isCompact]);

  const layers = React.useMemo<LayerDefinition[]>(() => {
    return [
      {
        id: "header",
        gridArea: "header",
        component: <HeaderSection isCompact={isCompact} viewportWidth={viewportWidth} />,
      },
      {
        id: "nav",
        gridArea: "nav",
        component: <NavigationPanel isCompact={isCompact} />,
      },
      {
        id: "content",
        gridArea: "content",
        component: <ContentArea />,
      },
      {
        id: "insights",
        gridArea: "insights",
        component: <InsightsPanel />,
      },
      {
        id: "footer",
        gridArea: "footer",
        component: <FooterPanel isCompact={isCompact} />,
      },
    ];
  }, [isCompact, viewportWidth]);

  const frameConfig = React.useMemo<PanelLayoutConfig>(() => {
    return {
      areas: [["guide", "viewport", "details"]],
      rows: [{ size: "auto" }],
      columns: [
        { size: "280px", resizable: true, minSize: 220, maxSize: 360 },
        { size: "minmax(640px, 1fr)", resizable: true, minSize: 420, maxSize: 1200 },
        { size: "260px", resizable: true, minSize: 200, maxSize: 360 },
      ],
      gap: "12px",
    };
  }, []);

  const frameLayers = React.useMemo<LayerDefinition[]>(() => {
    return [
      {
        id: "guide",
        gridArea: "guide",
        component: <GuidePanel breakpoint={BREAKPOINT} />,
      },
      {
        id: "viewport",
        gridArea: "viewport",
        component: (
          <div className={styles.frameViewport} ref={viewportRef}>
            <div className={styles.metaRow}>
              <div>
                <p className={styles.kicker}>レスポンシブレイアウト</p>
                <h2 className={styles.title}>Change the grid as viewports shrink</h2>
              </div>
              <div className={styles.breakpoint}>
                <span className={styles.badge}>Breakpoint {BREAKPOINT}px</span>
                <span className={`${styles.mode} ${isCompact ? styles.compact : styles.desktop}`}>
                  {isCompact ? "Compact mode" : "Desktop mode"}
                </span>
                <div className={styles.width}>
                  <span className={styles.widthLabel}>Viewport</span>
                  <span className={styles.widthValue}>{Math.round(viewportWidth)}px</span>
                </div>
              </div>
            </div>
            <GridLayout config={layoutConfig} layers={layers} />
          </div>
        ),
      },
      {
        id: "details",
        gridArea: "details",
        component: <DetailsPanel isCompact={isCompact} width={viewportWidth} />,
      },
    ];
  }, [isCompact, layoutConfig, layers, viewportWidth]);

  return (
    <div className={styles.container}>
      <div className={styles.surface}>
        <GridLayout config={frameConfig} layers={frameLayers} />
      </div>
    </div>
  );
};

export const code = `import * as React from "react";
import { GridLayout } from "react-panel-layout";
import type { LayerDefinition, PanelLayoutConfig } from "react-panel-layout";

const BREAKPOINT = 960;

const desktopConfig: PanelLayoutConfig = {
  areas: [
    ["header", "header", "header", "header"],
    ["nav", "content", "content", "insights"],
    ["nav", "content", "content", "insights"],
    ["footer", "footer", "footer", "insights"],
  ],
  rows: [{ size: "auto" }, { size: "1fr" }, { size: "1fr" }, { size: "auto" }],
  columns: [
    { size: "280px", resizable: true, minSize: 220, maxSize: 360 },
    { size: "1fr" },
    { size: "1fr" },
    { size: "320px", resizable: true, minSize: 260, maxSize: 420 },
  ],
  gap: "12px",
};

const compactConfig: PanelLayoutConfig = {
  areas: [
    ["header", "header"],
    ["content", "content"],
    ["insights", "insights"],
    ["nav", "nav"],
    ["footer", "footer"],
  ],
  rows: [{ size: "auto" }, { size: "1fr" }, { size: "auto" }, { size: "auto" }, { size: "auto" }],
  columns: [{ size: "1fr" }, { size: "1fr" }],
  gap: "12px",
};

export const ResponsiveLayout = () => {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const node = viewportRef.current;
    if (!node) {
      return;
    }
    const update = () => {
      const rect = node.getBoundingClientRect();
      setWidth(Math.round(rect.width));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const isCompact = width > 0 && width < BREAKPOINT;
  const layout = isCompact ? compactConfig : desktopConfig;

  const layers: LayerDefinition[] = [
    { id: "header", gridArea: "header", component: <Header /> },
    { id: "nav", gridArea: "nav", component: <Navigation /> },
    { id: "content", gridArea: "content", component: <Content /> },
    { id: "insights", gridArea: "insights", component: <Insights /> },
    { id: "footer", gridArea: "footer", component: <Footer /> },
  ];

  return (
    <div ref={viewportRef}>
      <GridLayout config={layout} layers={layers} />
    </div>
  );
};`;
