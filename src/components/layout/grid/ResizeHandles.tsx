/**
 * @file Presentational resize handles for floating layers (corner + edge).
 */
import * as React from "react";
import styles from "./ResizeHandles.module.css";

export type HorizontalEdge = "left" | "right";
export type VerticalEdge = "top" | "bottom";

export type ResizeHandleConfig =
  | {
      key: "top-left" | "top-right" | "bottom-left" | "bottom-right";
      variant: "corner";
      horizontal: HorizontalEdge;
      vertical: VerticalEdge;
    }
  | {
      key: "left" | "right" | "top" | "bottom";
      variant: "edge";
      horizontal?: HorizontalEdge;
      vertical?: VerticalEdge;
    };

const RESIZE_HANDLE_CONFIGS: ReadonlyArray<ResizeHandleConfig> = [
  { key: "top-left", variant: "corner", horizontal: "left", vertical: "top" },
  { key: "top-right", variant: "corner", horizontal: "right", vertical: "top" },
  { key: "bottom-left", variant: "corner", horizontal: "left", vertical: "bottom" },
  { key: "bottom-right", variant: "corner", horizontal: "right", vertical: "bottom" },
  { key: "left", variant: "edge", horizontal: "left" },
  { key: "right", variant: "edge", horizontal: "right" },
  { key: "top", variant: "edge", vertical: "top" },
  { key: "bottom", variant: "edge", vertical: "bottom" },
];

export type ResizeHandlesProps = {
  layerId: string;
  onPointerDown: (
    id: string,
    config: ResizeHandleConfig,
    event: React.PointerEvent<HTMLDivElement>,
  ) => void;
};

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({ layerId, onPointerDown }) => {
  return (
    <>
      {RESIZE_HANDLE_CONFIGS.map((config) => {
        const variantClass = config.variant === "corner" ? styles.cornerHandle : styles.edgeHandle;
        const classNames = `${styles.resizeHandle} ${variantClass}`;
        const datasetProps =
          config.variant === "corner" ? { "data-resize-corner": config.key } : { "data-resize-edge": config.key };
        return (
          <div
            key={config.key}
            role="presentation"
            aria-hidden="true"
            className={classNames}
            {...datasetProps}
            onPointerDown={(event) => onPointerDown(layerId, config, event)}
          />
        );
      })}
    </>
  );
};

