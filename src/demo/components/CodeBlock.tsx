/**
 * @file CodeBlock component for displaying sample code
 */
import * as React from "react";
import styles from "./CodeBlock.module.css";

export type CodeBlockProps = {
  code: string;
  title?: string;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, title = "Sample Code" }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span className={styles.codeTitle}>{title}</span>
        <button onClick={handleCopy} className={`${styles.copyButton} ${copied ? styles.copied : ""}`}>
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <div className={styles.codeContent}>
        <pre>{code}</pre>
      </div>
    </div>
  );
};
