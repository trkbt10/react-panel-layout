/**
 * @file Renders floating layers inside a dedicated browser popup window.
 */
import * as React from "react";
import { createPortal } from "react-dom";
import type { LayerDefinition } from "./types";
import type { PopupWindowOptions, WindowPosition, WindowBounds } from "../types";
import { LayerInstanceProvider } from "./LayerInstanceContext";

const ensureNumericOffset = (value: number | string | undefined, key: keyof WindowPosition, layerId: string): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  throw new Error(`Popup layer "${layerId}" requires a numeric "${key}" value.`);
};

const resolvePopupAnchor = (position: WindowPosition | undefined, layerId: string): { left: number; top: number } => {
  if (!position) {
    throw new Error(`Popup layer "${layerId}" must define position (left/top).`);
  }
  return {
    left: ensureNumericOffset(position.left, "left", layerId),
    top: ensureNumericOffset(position.top, "top", layerId),
  };
};

const numericFeature = (value: number): string => {
  return `${Math.round(value)}`;
};

const booleanFeature = (value: boolean | undefined): string | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return value ? "yes" : "no";
};

const buildWindowFeatures = (
  layerId: string,
  position: WindowPosition | undefined,
  width: number | string | undefined,
  height: number | string | undefined,
  options: PopupWindowOptions | undefined,
): string => {
  const features: Record<string, string> = {};
  const anchor = resolvePopupAnchor(position, layerId);

  if (typeof width !== "number" || typeof height !== "number") {
    throw new Error(`Popup layer "${layerId}" requires numeric width/height.`);
  }
  features.width = numericFeature(width);
  features.height = numericFeature(height);
  features.left = numericFeature(anchor.left);
  features.top = numericFeature(anchor.top);

  const overrides = options?.features;
  if (overrides) {
    const toolbar = booleanFeature(overrides.toolbar);
    const menubar = booleanFeature(overrides.menubar);
    const location = booleanFeature(overrides.location);
    const status = booleanFeature(overrides.status);
    const resizable = booleanFeature(overrides.resizable);
    const scrollbars = booleanFeature(overrides.scrollbars);

    if (toolbar !== undefined) {
      features.toolbar = toolbar;
    }
    if (menubar !== undefined) {
      features.menubar = menubar;
    }
    if (location !== undefined) {
      features.location = location;
    }
    if (status !== undefined) {
      features.status = status;
    }
    if (resizable !== undefined) {
      features.resizable = resizable;
    }
    if (scrollbars !== undefined) {
      features.scrollbars = scrollbars;
    }
  }

  return Object.entries(features)
    .map(([key, value]) => `${key}=${value}`)
    .join(",");
};

const applyBoundsToWindow = (
  popupWindow: Window,
  layerId: string,
  position: WindowPosition | undefined,
  width: number | string | undefined,
  height: number | string | undefined,
) => {
  const anchor = resolvePopupAnchor(position, layerId);
  if (typeof width !== "number" || typeof height !== "number") {
    throw new Error(`Popup layer "${layerId}" requires numeric width/height.`);
  }
  popupWindow.moveTo(Math.round(anchor.left), Math.round(anchor.top));
  popupWindow.resizeTo(Math.round(width), Math.round(height));
};

type PopupLayerPortalProps = {
  layer: LayerDefinition;
};

export const PopupLayerPortal: React.FC<PopupLayerPortalProps> = ({ layer }) => {
  const floating = layer.floating;
  if (!floating) {
    throw new Error(`Layer "${layer.id}" is missing floating configuration required for popup mode.`);
  }
  const mode = floating.mode ?? "embedded";
  if (mode !== "popup") {
    throw new Error(`PopupLayerPortal received layer "${layer.id}" that is not configured for popup mode.`);
  }

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const popupWindowRef = React.useRef<Window | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const features = buildWindowFeatures(layer.id, floating.position, floating.width, floating.height, floating.popup);
    const windowName = floating.popup?.name ?? layer.id;
    const createdWindow = resolvePopupWindow(windowName, features, {
      position: floating.position,
      size: { width: floating.width as number, height: floating.height as number },
    }, floating.popup);

    if (!createdWindow) {
      throw new Error(`Failed to open popup window for layer "${layer.id}".`);
    }

    const openedWindow = createdWindow;

    popupWindowRef.current = openedWindow;

    if (floating.popup?.focus !== false) {
      openedWindow.focus();
    }

    if (!openedWindow.document.title) {
      openedWindow.document.title = layer.id;
    }
    openedWindow.document.body.innerHTML = "";
    const mountNode = openedWindow.document.createElement("div");
    mountNode.dataset.layerId = layer.id;
    openedWindow.document.body.appendChild(mountNode);
    containerRef.current = mountNode;
    setIsMounted(true);

    applyBoundsToWindow(openedWindow, layer.id, floating.position, floating.width, floating.height);

    const handleBeforeUnload = () => {
      popupWindowRef.current = null;
      containerRef.current = null;
      setIsMounted(false);
    };
    openedWindow.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      openedWindow.removeEventListener("beforeunload", handleBeforeUnload);
      if (floating.popup?.closeOnUnmount !== false) {
        openedWindow.close();
      }
      popupWindowRef.current = null;
      containerRef.current = null;
      setIsMounted(false);
    };
  }, [
    floating.popup?.closeOnUnmount,
    floating.popup?.features?.location,
    floating.popup?.features?.menubar,
    floating.popup?.features?.resizable,
    floating.popup?.features?.scrollbars,
    floating.popup?.features?.status,
    floating.popup?.features?.toolbar,
    floating.popup?.focus,
    floating.popup?.name,
    layer.id,
  ]);

  React.useEffect(() => {
    const popupWindow = popupWindowRef.current;
    if (!popupWindow) {
      return;
    }
    applyBoundsToWindow(popupWindow, layer.id, floating.position, floating.width, floating.height);
  }, [floating.position?.left, floating.position?.top, floating.height, floating.width, layer.id]);

  if (!isMounted || !containerRef.current) {
    return null;
  }

  return createPortal(<LayerInstanceProvider layerId={layer.id}>{layer.component}</LayerInstanceProvider>, containerRef.current);
};
const resolvePopupWindow = (
  windowName: string,
  features: string,
  bounds: WindowBounds,
  options: PopupWindowOptions | undefined,
): Window | null => {
  const customFactory = options?.createWindow;
  if (customFactory) {
    return customFactory({ name: windowName, features, bounds });
  }
  return window.open("", windowName, features);
};
