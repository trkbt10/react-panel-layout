/**
 * @file Basic Pivot hook demo - headless content switching
 */
import * as React from "react";
import { usePivot } from "../../../pivot";
import type { PivotItem } from "../../../pivot";
import { DemoButton } from "../../components/ui/DemoButton";
import styles from "./Pivot.module.css";

const items: PivotItem[] = [
  {
    id: "overview",
    label: "Overview",
    content: (
      <div className={styles.content}>
        <h3>Overview</h3>
        <p>
          This is the Overview panel. The Pivot hook provides headless content switching - you control the UI, it
          manages the state and accessibility.
        </p>
        <ul>
          <li>Controlled and uncontrolled modes</li>
          <li>ARIA attributes for accessibility</li>
          <li>React.Activity for efficient rendering</li>
        </ul>
      </div>
    ),
  },
  {
    id: "features",
    label: "Features",
    content: (
      <div className={styles.content}>
        <h3>Features</h3>
        <p>The usePivot hook provides:</p>
        <ul>
          <li>
            <strong>activeId</strong> - Current active item ID
          </li>
          <li>
            <strong>setActiveId</strong> - Change active item
          </li>
          <li>
            <strong>getItemProps</strong> - Props for navigation elements
          </li>
          <li>
            <strong>Outlet</strong> - Component to render content
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "usage",
    label: "Usage",
    content: (
      <div className={styles.content}>
        <h3>Usage</h3>
        <pre className={styles.codeBlock}>
          {`const { getItemProps, Outlet } = usePivot({
  items,
  defaultActiveId: "overview"
});`}
        </pre>
      </div>
    ),
  },
];

export const PivotBasics: React.FC = () => {
  const { activeId, getItemProps, Outlet } = usePivot({
    items,
    defaultActiveId: "overview",
  });

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        {items.map((item) => {
          const props = getItemProps(item.id);
          return (
            <DemoButton
              key={item.id}
              variant={props["aria-selected"] ? "primary" : "secondary"}
              size="md"
              onClick={props.onClick}
              aria-selected={props["aria-selected"]}
              tabIndex={props.tabIndex}
              data-pivot-item={props["data-pivot-item"]}
              data-active={props["data-active"]}
            >
              {item.label}
            </DemoButton>
          );
        })}
      </nav>
      <div className={styles.panel}>
        <div className={styles.indicator}>Active: {activeId}</div>
        <Outlet />
      </div>
    </div>
  );
};

export const code = `import * as React from "react";
import { usePivot } from "react-panel-layout/pivot";

const items = [
  { id: "overview", label: "Overview", content: <OverviewContent /> },
  { id: "features", label: "Features", content: <FeaturesContent /> },
  { id: "usage", label: "Usage", content: <UsageContent /> },
];

export function PivotBasics() {
  const { activeId, getItemProps, Outlet } = usePivot({
    items,
    defaultActiveId: "overview",
  });

  return (
    <div>
      <nav>
        {items.map((item) => {
          const props = getItemProps(item.id);
          return (
            <button
              key={item.id}
              onClick={props.onClick}
              aria-selected={props["aria-selected"]}
              tabIndex={props.tabIndex}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
      <div>
        <p>Active: {activeId}</p>
        <Outlet />
      </div>
    </div>
  );
}`;
