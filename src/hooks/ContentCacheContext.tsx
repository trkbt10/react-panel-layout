/**
 * @file Context + Provider pattern for shared content caching.
 *
 * Use this when you need to share content caching across a component tree,
 * such as when multiple child components need access to cached content.
 *
 * For local caching within a single component, use useContentCache directly.
 */
import * as React from "react";
import { useContentCache, type ContentResolver, type UseContentCacheResult } from "./useContentCache";

/**
 * Context value type for content cache.
 */
export type ContentCacheContextValue<TId extends string = string> = UseContentCacheResult<TId>;

/**
 * Creates a content cache context and associated hooks/providers.
 *
 * @example
 * ```tsx
 * // Create context for a specific use case
 * const { Provider, useCache } = createContentCacheContext<LayerId>('LayerContent');
 *
 * // In provider component
 * <Provider resolveContent={getLayerContent} validIds={layerIds}>
 *   {children}
 * </Provider>
 *
 * // In consumer component
 * const { getCachedContent } = useCache();
 * return <div>{getCachedContent(layerId)}</div>;
 * ```
 */
export function createContentCacheContext<TId extends string = string>(displayName: string): {
  /**
   * Provider component that manages content caching for its children.
   */
  Provider: React.FC<ContentCacheProviderProps<TId>>;
  /**
   * Hook to access the content cache from a child component.
   */
  useCache: () => ContentCacheContextValue<TId>;
  /**
   * The raw React context (for advanced use cases).
   */
  Context: React.Context<ContentCacheContextValue<TId> | null>;
} {
  const Context = React.createContext<ContentCacheContextValue<TId> | null>(null);
  Context.displayName = `${displayName}CacheContext`;

  const useCache = (): ContentCacheContextValue<TId> => {
    const ctx = React.useContext(Context);
    if (!ctx) {
      throw new Error(`use${displayName}Cache must be used within ${displayName}CacheProvider`);
    }
    return ctx;
  };

  const Provider: React.FC<ContentCacheProviderProps<TId>> = ({ resolveContent, validIds, children }) => {
    const cacheResult = useContentCache({ resolveContent, validIds });

    const value = React.useMemo<ContentCacheContextValue<TId>>(
      () => cacheResult,
      [cacheResult],
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };
  Provider.displayName = `${displayName}CacheProvider`;

  return { Provider, useCache, Context };
}

/**
 * Props for content cache provider components.
 */
export type ContentCacheProviderProps<TId extends string = string> = React.PropsWithChildren<{
  /**
   * Function to resolve content by ID.
   */
  resolveContent: ContentResolver<TId>;
  /**
   * Current valid IDs for cache cleanup.
   */
  validIds: readonly TId[];
}>;
