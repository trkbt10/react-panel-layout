/**
 * @file Shared floating panel frame components for reusable overlay styling
 */
import * as React from "react";
import {
  FLOATING_PANEL_BORDER_RADIUS,
  FLOATING_PANEL_GAP,
  FLOATING_PANEL_HEADER_PADDING_Y,
  FLOATING_PANEL_HEADER_PADDING_X,
  FLOATING_PANEL_CONTENT_PADDING,
  FLOATING_PANEL_META_FONT_SIZE,
  FLOATING_PANEL_CONTROLS_GAP,
  FLOATING_PANEL_CLOSE_BUTTON_FONT_SIZE,
  FLOATING_PANEL_CLOSE_BUTTON_PADDING,
  FLOATING_PANEL_SURFACE_COLOR,
  FLOATING_PANEL_SURFACE_2_COLOR,
  FLOATING_PANEL_BORDER_COLOR,
  FLOATING_PANEL_MUTED_FG_COLOR,
  FLOATING_PANEL_SHADOW,
} from "../../constants/styles";

const shadowWrapperStyle: React.CSSProperties = {
  borderRadius: FLOATING_PANEL_BORDER_RADIUS,
  boxShadow: FLOATING_PANEL_SHADOW,
};

const overflowWrapperStyle: React.CSSProperties = {
  borderRadius: FLOATING_PANEL_BORDER_RADIUS,
  overflow: "hidden",
};

const innerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderRadius: FLOATING_PANEL_BORDER_RADIUS,
  border: `1px solid ${FLOATING_PANEL_BORDER_COLOR}`,
  background: FLOATING_PANEL_SURFACE_COLOR,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: FLOATING_PANEL_GAP,
  padding: `${FLOATING_PANEL_HEADER_PADDING_Y} ${FLOATING_PANEL_HEADER_PADDING_X}`,
  borderBottom: `1px solid ${FLOATING_PANEL_BORDER_COLOR}`,
  background: FLOATING_PANEL_SURFACE_2_COLOR,
};

const titleStyle: React.CSSProperties = {
  fontWeight: 600,
};

const metaStyle: React.CSSProperties = {
  marginLeft: "auto",
  color: FLOATING_PANEL_MUTED_FG_COLOR,
  fontSize: FLOATING_PANEL_META_FONT_SIZE,
};

const controlsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: FLOATING_PANEL_CONTROLS_GAP,
};

const closeButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: FLOATING_PANEL_CLOSE_BUTTON_FONT_SIZE,
  padding: FLOATING_PANEL_CLOSE_BUTTON_PADDING,
  lineHeight: 1,
};

const contentStyle: React.CSSProperties = {
  padding: FLOATING_PANEL_CONTENT_PADDING,
  overflow: "auto",
};

export type FloatingPanelFrameProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "style"> & {
  style?: React.CSSProperties;
};

export const FloatingPanelFrame = React.forwardRef<HTMLDivElement, FloatingPanelFrameProps>(function FloatingPanelFrame(
  { style: propStyle, children, ...props },
  ref,
) {
  const combinedShadowStyle = React.useMemo(
    () => ({ ...shadowWrapperStyle, ...propStyle }),
    [propStyle],
  );

  const combinedOverflowStyle = React.useMemo(() => {
    const hasCustomBorderRadius = propStyle?.borderRadius !== undefined;
    const hasHeight = propStyle?.height !== undefined;

    if (!hasCustomBorderRadius && !hasHeight) {
      return overflowWrapperStyle;
    }

    const result: React.CSSProperties = { ...overflowWrapperStyle };
    if (hasCustomBorderRadius) {
      result.borderRadius = propStyle.borderRadius;
    }
    if (hasHeight) {
      result.height = propStyle.height;
    }
    return result;
  }, [propStyle?.borderRadius, propStyle?.height]);

  const combinedInnerStyle = React.useMemo(() => {
    const hasCustomBorderRadius = propStyle?.borderRadius !== undefined;
    const hasHeight = propStyle?.height !== undefined;

    if (!hasCustomBorderRadius && !hasHeight) {
      return innerStyle;
    }

    const result: React.CSSProperties = { ...innerStyle };
    if (hasCustomBorderRadius) {
      result.borderRadius = propStyle.borderRadius;
    }
    if (hasHeight) {
      result.height = propStyle.height;
    }
    return result;
  }, [propStyle?.borderRadius, propStyle?.height]);

  return (
    <div ref={ref} style={combinedShadowStyle} {...props}>
      <div style={combinedOverflowStyle}>
        <div style={combinedInnerStyle}>{children}</div>
      </div>
    </div>
  );
});

export type FloatingPanelHeaderProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "style"> & {
  style?: React.CSSProperties;
};

export const FloatingPanelHeader: React.FC<FloatingPanelHeaderProps> = ({ style: propStyle, ...props }) => {
  const combinedStyle = React.useMemo(() => ({ ...headerStyle, ...propStyle }), [propStyle]);
  return <div style={combinedStyle} {...props} />;
};

export type FloatingPanelTitleProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "className" | "style"> & {
  style?: React.CSSProperties;
};

export const FloatingPanelTitle: React.FC<FloatingPanelTitleProps> = ({ style: propStyle, ...props }) => {
  const combinedStyle = React.useMemo(() => ({ ...titleStyle, ...propStyle }), [propStyle]);
  return <span style={combinedStyle} {...props} />;
};

export type FloatingPanelMetaProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "className" | "style"> & {
  style?: React.CSSProperties;
};

export const FloatingPanelMeta: React.FC<FloatingPanelMetaProps> = ({ style: propStyle, ...props }) => {
  const combinedStyle = React.useMemo(() => ({ ...metaStyle, ...propStyle }), [propStyle]);
  return <span style={combinedStyle} {...props} />;
};

export type FloatingPanelControlsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "style"> & {
  style?: React.CSSProperties;
};

export const FloatingPanelControls: React.FC<FloatingPanelControlsProps> = ({ style: propStyle, ...props }) => {
  const combinedStyle = React.useMemo(() => ({ ...controlsStyle, ...propStyle }), [propStyle]);
  return <div style={combinedStyle} {...props} />;
};

export type FloatingPanelContentProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "style"> & {
  style?: React.CSSProperties;
};

export const FloatingPanelContent = React.forwardRef<HTMLDivElement, FloatingPanelContentProps>(
  function FloatingPanelContent({ style: propStyle, ...props }, ref) {
    const combinedStyle = React.useMemo(() => ({ ...contentStyle, ...propStyle }), [propStyle]);
    return <div ref={ref} style={combinedStyle} {...props} />;
  },
);

export type FloatingPanelCloseButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "style" | "children"
> & {
  style?: React.CSSProperties;
};

export const FloatingPanelCloseButton: React.FC<FloatingPanelCloseButtonProps> = ({ style: propStyle, ...props }) => {
  const combinedStyle = React.useMemo(() => ({ ...closeButtonStyle, ...propStyle }), [propStyle]);
  return (
    <button type="button" style={combinedStyle} {...props}>
      ×
    </button>
  );
};

FloatingPanelFrame.displayName = "FloatingPanelFrame";
FloatingPanelHeader.displayName = "FloatingPanelHeader";
FloatingPanelTitle.displayName = "FloatingPanelTitle";
FloatingPanelMeta.displayName = "FloatingPanelMeta";
FloatingPanelControls.displayName = "FloatingPanelControls";
FloatingPanelContent.displayName = "FloatingPanelContent";
FloatingPanelCloseButton.displayName = "FloatingPanelCloseButton";
