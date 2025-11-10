/**
 * @file CodePreview component - Displays code in a collapsible section
 */
import * as React from "react";
import { CodeBlock } from "./CodeBlock";
import styles from "./CodePreview.module.css";

export type CodePreviewProps = {
  code: string;
  title?: string;
  defaultOpen?: boolean;
  summaryText?: string;
};

/**
 * CodePreview component
 * Wraps CodeBlock in a details/summary element for collapsible code display
 */
export const CodePreview: React.FC<CodePreviewProps> = ({
  code,
  title = "Sample Code",
  defaultOpen = false,
  summaryText = "Show Code",
}) => {
  return (
    <details className={styles.codePreview} open={defaultOpen}>
      <summary className={styles.summary}>{summaryText}</summary>
      <CodeBlock code={code} title={title} />
    </details>
  );
};
