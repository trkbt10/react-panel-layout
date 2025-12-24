/**
 * @file Pivot transitions demo - CSS-based transitions via design tokens
 */
import * as React from "react";
import { usePivot } from "../../../../pivot/index";
import type { PivotItem } from "../../../../pivot/index";
import styles from "./Pivot.module.css";
import animationsCss from "../../../styles/animations.css?raw";

const createItems = (prefix: string): PivotItem[] => [
  {
    id: `${prefix}-1`,
    label: "Tab 1",
    content: (
      <div className={styles.transitionDemoInnerContent}>
        <h3>Content 1</h3>
        <p>This is the first tab content.</p>
      </div>
    ),
  },
  {
    id: `${prefix}-2`,
    label: "Tab 2",
    content: (
      <div className={styles.transitionDemoInnerContent}>
        <h3>Content 2</h3>
        <p>This is the second tab content.</p>
      </div>
    ),
  },
  {
    id: `${prefix}-3`,
    label: "Tab 3",
    content: (
      <div className={styles.transitionDemoInnerContent}>
        <h3>Content 3</h3>
        <p>This is the third tab content.</p>
      </div>
    ),
  },
];

type TransitionConfig = {
  label: string;
  description: string;
  transitionMode: "css" | "none";
};

const transitionConfigs: TransitionConfig[] = [
  {
    label: "CSS Transitions (Default)",
    description: "Smooth opacity fade using design tokens",
    transitionMode: "css",
  },
  {
    label: "No Transitions",
    description: "Instant switch - uses React.Activity for memory optimization",
    transitionMode: "none",
  },
];

type TransitionDemoProps = {
  config: TransitionConfig;
  index: number;
};

const TransitionDemo: React.FC<TransitionDemoProps> = ({ config, index }) => {
  const items = React.useMemo(() => createItems(`demo-${index}`), [index]);
  const { getItemProps, Outlet } = usePivot({
    items,
    defaultActiveId: items[0].id,
    transitionMode: config.transitionMode,
  });

  return (
    <div className={styles.transitionDemoCard}>
      <div className={styles.transitionDemoHeader}>
        <h4>{config.label}</h4>
        <span className={styles.transitionDemoDescription}>{config.description}</span>
        <code className={styles.transitionDemoCode}>transitionMode: "{config.transitionMode}"</code>
      </div>
      <div className={styles.transitionDemoTabs}>
        {items.map((item) => {
          const props = getItemProps(item.id);
          return (
            <button
              key={item.id}
              className={styles.transitionDemoTab}
              onClick={props.onClick}
              data-active={props["data-active"]}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className={styles.transitionDemoContent}>
        <Outlet />
      </div>
    </div>
  );
};

export const PivotTransitions: React.FC = () => {
  return (
    <div className={styles.transitionsContainer}>
      <div className={styles.transitionsGrid}>
        {transitionConfigs.map((config, index) => (
          <TransitionDemo key={config.label} config={config} index={index} />
        ))}
      </div>

      <div className={styles.designTokensSection}>
        <h4>Design Tokens</h4>
        <p>Customize animations via CSS custom properties:</p>
        <pre className={styles.codeBlock}>{animationsCss.trim()}</pre>
      </div>
    </div>
  );
};
