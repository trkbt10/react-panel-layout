/**
 * @file FloatingWindow component with chrome support
 *
 * Renders floating panel content with optional built-in chrome (FloatingPanelFrame).
 * When chrome is enabled and header is provided, header becomes the drag handle.
 */
import * as React from "react";
import type { FloatingBehavior } from "../../types";
import {
  FloatingPanelCloseButton,
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelControls,
  FloatingPanelContent,
} from "../paneling/FloatingPanelFrame";

export type FloatingWindowProps = {
  id: string;
  config: FloatingBehavior;
  onClose: () => void;
  children: React.ReactNode;
};

type CloseButtonProps = {
  onClick: () => void;
};

const CloseButton: React.FC<CloseButtonProps> = ({ onClick }) => (
  <FloatingPanelControls>
    <FloatingPanelCloseButton onClick={onClick} aria-label="Close window" data-drag-ignore="true" />
  </FloatingPanelControls>
);

type FloatingWindowHeaderProps = {
  header?: FloatingBehavior["header"];
  draggable?: boolean;
  onClose: () => void;
};

const FloatingWindowHeader: React.FC<FloatingWindowHeaderProps> = ({ header, draggable, onClose }) => {
  if (!header) {
    return null;
  }

  const showCloseButton = header.showCloseButton ?? false;
  const dragHandleProps = draggable ? { "data-drag-handle": "true" } : {};
  const cursorStyle = draggable ? "grab" : undefined;

  return (
    <FloatingPanelHeader {...dragHandleProps} style={{ cursor: cursorStyle }}>
      {header.title ? <FloatingPanelTitle>{header.title}</FloatingPanelTitle> : null}
      {showCloseButton ? <CloseButton onClick={onClose} /> : null}
    </FloatingPanelHeader>
  );
};

type FloatingWindowViewProps = {
  header?: FloatingBehavior["header"];
  draggable?: boolean;
  chrome: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const FloatingWindowView: React.FC<FloatingWindowViewProps> = ({ header, draggable, chrome, onClose, children }) => {
  if (!chrome) {
    return <>{children}</>;
  }

  return (
    <FloatingPanelFrame style={{ height: "100%", width: "100%" }}>
      <FloatingWindowHeader header={header} draggable={draggable} onClose={onClose} />
      <FloatingPanelContent style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </FloatingPanelContent>
    </FloatingPanelFrame>
  );
};

export const FloatingWindow: React.FC<FloatingWindowProps> = ({ id, config, onClose, children }) => {
  const chrome = config.chrome ?? false;
  const draggable = config.draggable ?? false;
  const ariaLabel = config.header?.title ?? config.ariaLabel ?? "Floating window";

  return (
    <div data-floating-window={id} role="dialog" aria-label={ariaLabel} style={{ height: "100%", width: "100%" }}>
      <FloatingWindowView header={config.header} draggable={draggable} chrome={chrome} onClose={onClose}>
        {children}
      </FloatingWindowView>
    </div>
  );
};

FloatingWindow.displayName = "FloatingWindow";
