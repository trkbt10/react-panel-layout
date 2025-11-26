/**
 * @file Pivot transitions demo - CSS-based transitions via design tokens
 */
import * as React from "react";
import { usePivot } from "../../../pivot";
import type { PivotItem } from "../../../pivot";
import styles from "./Pivot.module.css";

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
        <pre className={styles.codeBlock}>{`/* Define enter/leave keyframes */
@keyframes pivotEnter {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pivotLeave {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Reference via design tokens */
:root {
  --rpl-pivot-animation-enter: pivotEnter 150ms ease-out forwards;
  --rpl-pivot-animation-leave: pivotLeave 150ms ease-out forwards;
}`}</pre>
      </div>
    </div>
  );
};

export const code = `import { usePivot } from "react-panel-layout/pivot";

// CSS animations (default) - customize via design tokens
const { Outlet } = usePivot({
  items,
  transitionMode: "css", // default
});

// No animations - instant switch
const { Outlet: Outlet2 } = usePivot({
  items,
  transitionMode: "none",
});

// Customize via CSS keyframes and custom properties:
// @keyframes pivotEnter { from { opacity: 0; } to { opacity: 1; } }
// @keyframes pivotLeave { from { opacity: 1; } to { opacity: 0; } }
// :root {
//   --rpl-pivot-animation-enter: pivotEnter 150ms ease-out forwards;
//   --rpl-pivot-animation-leave: pivotLeave 150ms ease-out forwards;
// }`;
