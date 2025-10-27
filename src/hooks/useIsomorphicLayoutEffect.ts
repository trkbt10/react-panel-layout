/**
 * @file useIsomorphicLayoutEffect - SSR-safe version of useLayoutEffect
 *
 * Uses useLayoutEffect on the client and useEffect on the server to avoid warnings
 * during server-side rendering (e.g., with Next.js)
 */
import * as React from "react";

/**
 * Check if we're running in a browser environment
 */
const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

/**
 * SSR-safe version of useLayoutEffect
 *
 * - Client: Uses useLayoutEffect for synchronous layout updates
 * - Server: Uses useEffect to avoid SSR warnings
 *
 * @example
 * ```tsx
 * useIsomorphicLayoutEffect(() => {
 *   // This runs synchronously after DOM mutations on the client
 *   // but safely falls back to useEffect on the server
 *   measureElement();
 * }, [deps]);
 * ```
 */
export const useIsomorphicLayoutEffect = isBrowser ? React.useLayoutEffect : React.useEffect;
