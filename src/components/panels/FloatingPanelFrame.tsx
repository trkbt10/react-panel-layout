/**
 * @file Shared floating panel frame components for reusable overlay styling
 */
import * as React from "react";
import styles from "./FloatingPanelFrame.module.css";

export type FloatingPanelFrameProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className">;

export const FloatingPanelFrame = React.forwardRef<HTMLDivElement, FloatingPanelFrameProps>(function FloatingPanelFrame(
  props,
  ref,
) {
  return <div ref={ref} className={styles.frame} {...props} />;
});

export type FloatingPanelHeaderProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className">;

export const FloatingPanelHeader: React.FC<FloatingPanelHeaderProps> = (props) => {
  return <div className={styles.header} {...props} />;
};

export type FloatingPanelTitleProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "className">;

export const FloatingPanelTitle: React.FC<FloatingPanelTitleProps> = (props) => {
  return <span className={styles.title} {...props} />;
};

export type FloatingPanelMetaProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "className">;

export const FloatingPanelMeta: React.FC<FloatingPanelMetaProps> = (props) => {
  return <span className={styles.meta} {...props} />;
};

export type FloatingPanelControlsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className">;

export const FloatingPanelControls: React.FC<FloatingPanelControlsProps> = (props) => {
  return <div className={styles.controls} {...props} />;
};

export type FloatingPanelContentProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className">;

export const FloatingPanelContent = React.forwardRef<HTMLDivElement, FloatingPanelContentProps>(
  function FloatingPanelContent(props, ref) {
    return <div ref={ref} className={styles.content} {...props} />;
  },
);

FloatingPanelFrame.displayName = "FloatingPanelFrame";
FloatingPanelHeader.displayName = "FloatingPanelHeader";
FloatingPanelTitle.displayName = "FloatingPanelTitle";
FloatingPanelMeta.displayName = "FloatingPanelMeta";
FloatingPanelControls.displayName = "FloatingPanelControls";
FloatingPanelContent.displayName = "FloatingPanelContent";
