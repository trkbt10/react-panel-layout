/**
 * @file Convenience component for single-sample demo pages
 */
import * as React from "react";
import { SplitDemoLayout } from "./SplitDemoLayout";
import styles from "./SingleSamplePage.module.css";

export type SingleSamplePageProps = {
  title: string;
  code: string;
  children: React.ReactNode;
  codeTitle?: string;
  previewHeight?: number | string;
  maxWidth?: number | string;
};

/**
 * SingleSamplePage - Full-height layout for demo pages
 * Uses the entire right pane with left code / right preview split
 * No extra chrome - directly renders the SplitDemoLayout
 */
export const SingleSamplePage: React.FC<SingleSamplePageProps> = ({
  title,
  code,
  children,
  codeTitle,
}) => {
  return (
    <div className={styles.container}>
      <SplitDemoLayout code={code} codeTitle={codeTitle ?? title}>
        {children}
      </SplitDemoLayout>
    </div>
  );
};
