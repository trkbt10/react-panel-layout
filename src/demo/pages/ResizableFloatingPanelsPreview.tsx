/**
 * @file Resizable floating panels preview page
 */
import * as React from "react";
import { GridLayout } from "../../components/grid/GridLayout";
import type { LayerDefinition, PanelLayoutConfig } from "../../panel-system/types";
import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelContent,
} from "../../components/paneling/FloatingPanelFrame";
import { useLayerDragHandle } from "../../modules/grid/useLayerDragHandle";
import { Section, Story } from "../components/Story";
import { CodeBlock } from "../components/CodeBlock";
import styles from "./ResizableFloatingPanelsPreview.module.css";

const EDGE_RESIZE_DEMO_CODE = `import {
  GridLayout,
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelContent,
  useLayerDragHandle,
} from "react-panel-layout";

const config = {
  areas: [["main"]],
  columns: [{ size: "1fr" }],
  rows: [{ size: "420px" }],
};

const MetricsPanel = () => {
  const dragHandleProps = useLayerDragHandle();

  return (
    <FloatingPanelFrame>
      <FloatingPanelHeader {...dragHandleProps}>
        <FloatingPanelTitle>Session Metrics</FloatingPanelTitle>
      </FloatingPanelHeader>
      <FloatingPanelContent>…</FloatingPanelContent>
    </FloatingPanelFrame>
  );
};

const layers = [
  {
    id: "workspace",
    gridArea: "main",
    component: <div className="workspace" />,
  },
  {
    id: "floating",
    component: <MetricsPanel />,
    position: { left: 48, top: 48 },
    width: 320,
    height: 240,
    zIndex: 10,
    floating: {
      constraints: { minWidth: 240, minHeight: 180 },
      resizable: true,
      draggable: true,
    },
  },
];`;

const FloatingWorkspaceDemo: React.FC = () => {
  const [primarySize, setPrimarySize] = React.useState({ width: 320, height: 240 });
  const [notesSize, setNotesSize] = React.useState({ width: 260, height: 220 });

  const handlePrimarySizeChange = React.useCallback((next: { width: number; height: number }) => {
    setPrimarySize((previous) => {
      const widthMatches = previous.width === next.width;
      const heightMatches = previous.height === next.height;
      return widthMatches && heightMatches ? previous : next;
    });
  }, []);

  const handleNotesSizeChange = React.useCallback((next: { width: number; height: number }) => {
    setNotesSize((previous) => {
      const widthMatches = previous.width === next.width;
      const heightMatches = previous.height === next.height;
      return widthMatches && heightMatches ? previous : next;
    });
  }, []);

  const config = React.useMemo<PanelLayoutConfig>(
    () => ({
      areas: [["main"]],
      columns: [{ size: "1fr" }],
      rows: [{ size: "420px" }],
      gap: "0",
    }),
    [],
  );

  const MetricsPanel: React.FC = () => {
    const dragHandleProps = useLayerDragHandle();

    return (
      <FloatingPanelFrame style={{ height: "100%" }}>
        <FloatingPanelHeader {...dragHandleProps}>
          <FloatingPanelTitle>Session Metrics</FloatingPanelTitle>
          <span className={styles.badge}>Resizable</span>
        </FloatingPanelHeader>
        <FloatingPanelContent>
          <div className={styles.panelBody}>
            <div className={styles.panelSummary}>
              <div>
                <span className={styles.metricLabel}>Width</span>
                <strong className={styles.metricValue}>{primarySize.width}px</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>Height</span>
                <strong className={styles.metricValue}>{primarySize.height}px</strong>
              </div>
            </div>
            <ul className={styles.metricsList}>
              <li className={styles.metricsItem}>Drag the header to move the panel.</li>
              <li className={styles.metricsItem}>Use any edge to resize; corners support diagonal resizing.</li>
              <li className={styles.metricsItem}>Constraints: min 240 × 180, max 560 × 380.</li>
            </ul>
          </div>
        </FloatingPanelContent>
      </FloatingPanelFrame>
    );
  };

  const NotesPanel: React.FC = () => {
    const dragHandleProps = useLayerDragHandle();

    return (
      <FloatingPanelFrame style={{ height: "100%" }}>
        <FloatingPanelHeader {...dragHandleProps}>
          <FloatingPanelTitle>Creative Notes</FloatingPanelTitle>
        </FloatingPanelHeader>
        <FloatingPanelContent>
          <div className={styles.panelBody}>
            <p className={styles.notesIntro}>
              Resize from the right or bottom edges to make room for additional annotations.
            </p>
            <div className={styles.notesGrid}>
              <div>
                <span className={styles.metricLabel}>Width</span>
                <strong className={styles.metricValue}>{notesSize.width}px</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>Height</span>
                <strong className={styles.metricValue}>{notesSize.height}px</strong>
              </div>
            </div>
            <p className={styles.notesTip}>
              Edge handles appear on hover and remain active while resizing for improved precision.
            </p>
          </div>
        </FloatingPanelContent>
      </FloatingPanelFrame>
    );
  };

  const layers: LayerDefinition[] = [
    {
      id: "workspace",
      gridArea: "main",
      component: (
        <div className={styles.workspace}>
          <div className={styles.workspaceBackdrop} />
          <div className={styles.workspaceGrid} />
          <div className={styles.workspaceLabel}>Canvas Surface</div>
        </div>
      ),
    },
    {
      id: "metrics-panel",
      component: <MetricsPanel />,
      position: { left: 48, top: 48 },
      width: primarySize.width,
      height: primarySize.height,
      zIndex: 10,
      floating: {
        constraints: { minWidth: 240, minHeight: 180, maxWidth: 560, maxHeight: 380 },
        draggable: true,
        resizable: true,
        onResize: handlePrimarySizeChange,
      },
    },
    {
      id: "notes-panel",
      component: <NotesPanel />,
      position: { left: 420, top: 128 },
      width: notesSize.width,
      height: notesSize.height,
      zIndex: 12,
      floating: {
        constraints: { minWidth: 220, minHeight: 180, maxWidth: 480, maxHeight: 360 },
        draggable: true,
        resizable: true,
        onResize: handleNotesSizeChange,
      },
    },
  ];

  return (
    <div className={styles.demoSurface}>
      <GridLayout config={config} layers={layers} />
    </div>
  );
};

export const ResizableFloatingPanelsPreview: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Resizable Floating Panels</h1>
      <p className={styles.intro}>
        Floating layers can now be resized from any edge in addition to the existing corner handles. This demo shows how
        the edge handles behave inside a canvas environment and how you can react to the updated dimensions.
      </p>

      <Section title="Floating Panel Interactions">
        <Story
          title="Edge Resize Handles"
          description="Hover near the panel edges to reveal resize handles. All edges and corners are interactive when resizable is enabled."
        >
          <FloatingWorkspaceDemo />
        </Story>
        <CodeBlock code={EDGE_RESIZE_DEMO_CODE} />
      </Section>
    </div>
  );
};
