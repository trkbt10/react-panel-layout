/**
 * @file Shared layout wrapper for demo pages
 */
import * as React from "react";
import styles from "./DemoPage.module.css";

export type DemoPageProps = {
  title: string;
  children: React.ReactNode;
  intro?: React.ReactNode;
  /**
   * Maximum width for the inner content. Defaults to 1200px.
   */
  maxWidth?: number | string;
  /**
   * Optional padding around the page content. Defaults to 1.5rem.
   */
  padding?: number | string;
  /**
   * Enable full-height layout when the page needs to stretch.
   */
  fullHeight?: boolean;
};

const toCssValue = (value?: number | string): string | undefined => {
  if (typeof value === "number") {
    return `${value}px`;
  }
  return value;
};

export const DemoPage: React.FC<DemoPageProps> = ({
  title,
  intro,
  children,
  maxWidth,
  padding,
  fullHeight = false,
}) => {
  const resolvedMaxWidth = toCssValue(maxWidth) ?? "1200px";
  const resolvedPadding = toCssValue(padding) ?? "1.5rem";
  const pageClassName = fullHeight ? `${styles.page} ${styles.fullHeight}` : styles.page;
  const bodyClassName = fullHeight ? `${styles.body} ${styles.bodyStretch}` : styles.body;

  return (
    <div className={pageClassName} style={{ padding: resolvedPadding }}>
      <div className={styles.inner} style={{ maxWidth: resolvedMaxWidth }}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {intro ? <div className={styles.intro}>{intro}</div> : null}
        </header>
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>
  );
};
