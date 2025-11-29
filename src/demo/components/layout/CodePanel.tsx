/**
 * @file CodePanel component - Modern IDE-like code display panel
 */
import * as React from "react";
import styles from "./CodePanel.module.css";

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
}) => {
  const [copied, setCopied] = React.useState(false);
  const lines = React.useMemo(() => code.split("\n"), [code]);

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const containerStyle = React.useMemo(() => {
    if (!maxHeight) return undefined;
    return {
      maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
    };
  }, [maxHeight]);

  return (
    <div className={`${styles.container} ${className ?? ""}`}>
      {showHeader && (
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.dots}>
              <span className={`${styles.dot} ${styles.dotRed}`} />
              <span className={`${styles.dot} ${styles.dotYellow}`} />
              <span className={`${styles.dot} ${styles.dotGreen}`} />
            </div>
            <span className={styles.title}>{title}</span>
          </div>
          <button
            onClick={handleCopy}
            className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
            type="button"
            aria-label={copied ? "Copied!" : "Copy code"}
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      <div className={styles.content} style={containerStyle}>
        <pre className={styles.pre}>
          {showLineNumbers && (
            <div className={styles.lineNumbers} aria-hidden="true">
              {lines.map((_, i) => (
                <div key={i} className={styles.lineNumber}>
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <code className={styles.code}>{code}</code>
        </pre>
      </div>
    </div>
  );
};
