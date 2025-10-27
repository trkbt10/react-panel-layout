/**
 * @file Common Story components for preview pages
 */
import * as React from "react";
import styles from "./Story.module.css";

export type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className={styles.section}>
    <h2 className={styles.sectionTitle}>{title}</h2>
    {children}
  </div>
);

export type StoryProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export const Story: React.FC<StoryProps> = ({ title, description, children, actions }) => (
  <div className={styles.story}>
    <div className={styles.storyHeader}>
      <h3 className={styles.storyTitle}>{title}</h3>
      {description ? <p className={styles.storyDescription}>{description}</p> : null}
    </div>
    <div className={styles.storyPreview}>{children}</div>
    {actions ? <div className={styles.storyActions}>{actions}</div> : null}
  </div>
);

export type StoryActionButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export const StoryActionButton: React.FC<StoryActionButtonProps> = ({
  onClick,
  children,
  variant = "primary",
}) => (
  <button
    onClick={onClick}
    className={variant === "primary" ? styles.actionButton : `${styles.actionButton} ${styles.actionButtonSecondary}`}
  >
    {children}
  </button>
);
