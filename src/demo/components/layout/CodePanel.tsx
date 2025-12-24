/**
 * @file CodePanel component - Modern IDE-like code display panel
 */
import * as React from "react";
import type { BundledLanguage, BundledTheme } from "shiki";
import { useShikiHighlight } from "../../hooks/useShikiHighlight";
import styles from "./CodePanel.module.css";

type CopyIconProps = {
  copied: boolean;
};

const CopyIcon: React.FC<CopyIconProps> = ({ copied }) => {
  if (copied) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
};

type CodePanelHeaderProps = {
  title: string;
  copied: boolean;
  onCopy: () => void;
};

const CodePanelHeader: React.FC<CodePanelHeaderProps> = ({ title, copied, onCopy }) => {
  const buttonClassName = copied ? `${styles.copyButton} ${styles.copied}` : styles.copyButton;
  const ariaLabel = copied ? "Copied!" : "Copy code";

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <svg
          className={styles.codeIcon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        <span className={styles.title}>{title}</span>
      </div>
      <button onClick={onCopy} className={buttonClassName} type="button" aria-label={ariaLabel}>
        <CopyIcon copied={copied} />
      </button>
    </div>
  );
};

type LineNumbersProps = {
  count: number;
};

const LineNumbers: React.FC<LineNumbersProps> = ({ count }) => {
  const lineNumbers = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div className={styles.lineNumbers} aria-hidden="true">
      {lineNumbers.map((num) => (
        <div key={num} className={styles.lineNumber}>
          {num}
        </div>
      ))}
    </div>
  );
};

export type CodePanelProps = {
  code: string;
  title?: string;
  className?: string;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Whether to show the header bar */
  showHeader?: boolean;
  /** Maximum height for scrollable content */
  maxHeight?: string | number;
  /** Language for syntax highlighting (default: typescript) */
  language?: BundledLanguage;
  /** Theme for syntax highlighting (default: github-dark) */
  theme?: BundledTheme;
};

/**
 * CodePanel component
 * Modern IDE-like code display with syntax highlighting appearance
 */
export const CodePanel: React.FC<CodePanelProps> = ({
  code,
  title = "Code",
  className,
  showLineNumbers = true,
  showHeader = true,
  maxHeight,
  language = "jsx",
  theme = "github-dark",
}) => {
  const [copied, setCopied] = React.useState(false);
  const lineCount = React.useMemo(() => code.split("\n").length, [code]);
  const { html, isLoading } = useShikiHighlight({ code, language, theme });

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const containerStyle = React.useMemo(() => {
    if (!maxHeight) {
      return undefined;
    }
    const value = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
    return { maxHeight: value };
  }, [maxHeight]);

  const containerClassName = className ? `${styles.container} ${className}` : styles.container;

  const renderCode = (): React.ReactNode => {
    if (isLoading) {
      return <code className={styles.code}>{code}</code>;
    }
    return <div className={styles.shikiWrapper} dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className={containerClassName}>
      {showHeader ? <CodePanelHeader title={title} copied={copied} onCopy={handleCopy} /> : null}
      <div className={styles.content} style={containerStyle}>
        <pre className={styles.pre}>
          {showLineNumbers ? <LineNumbers count={lineCount} /> : null}
          {renderCode()}
        </pre>
      </div>
    </div>
  );
};
