/**
 * @file Convenience component for single-sample demo pages
 */
import * as React from "react";
import { CodePreview } from "../CodePreview";
import { DemoPage } from "./DemoPage";
import styles from "./SingleSamplePage.module.css";

export type SingleSamplePageProps = {
  title: string;
  code: string;
  children: React.ReactNode;
  codeTitle?: string;
  previewHeight?: number | string;
  maxWidth?: number | string;
};

const toCssValue = (value?: number | string): string | undefined => {
  if (typeof value === "number") {
    return `${value}px`;
  }
  return value;
};

export const SingleSamplePage: React.FC<SingleSamplePageProps> = ({
  title,
  code,
  children,
  codeTitle,
  previewHeight,
  maxWidth,
}) => {
  const heightValue = toCssValue(previewHeight);

  return (
    <DemoPage title={title} maxWidth={maxWidth}>
      <div className={styles.preview} style={heightValue ? { height: heightValue } : undefined}>
        {children}
      </div>
      <CodePreview code={code} title={codeTitle ?? `${title} Code`} />
    </DemoPage>
  );
};
