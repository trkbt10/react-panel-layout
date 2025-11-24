/**
 * @file Clone a DOM element for preview while keeping SSR safe.
 * Provides the cloned element as HTML string plus its measured size.
 */
import * as React from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

export const useClonedElementPreview = (
  sourceEl: HTMLElement | null,
): { html: string | null; size: { width: number; height: number } | null } => {
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null);
  const [html, setHtml] = React.useState<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!isBrowser || !sourceEl) {
      setSize(null);
      setHtml(null);
      return;
    }
    const rect = sourceEl.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });
    setHtml(sourceEl.outerHTML);
  }, [sourceEl]);

  return { html, size };
};
