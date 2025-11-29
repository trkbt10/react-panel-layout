/**
 * @file Shared content caching hook for preserving React component state.
 *
 * This hook provides a common pattern for caching ReactNode content by ID,
 * ensuring the same reference is returned for the same ID across re-renders.
 * This prevents component remounting when parent components re-create content arrays.
 *
 * Used by:
 * - PanelSystemContext (GridLayout layer content)
 * - usePivot (Pivot item content)
 * - ContentRegistry (Panel content)
 */
import * as React from "react";

/**
 * Function type for resolving content by ID.
 * Called only when content is not already cached.
 */
export type ContentResolver<TId extends string = string> = (id: TId) => React.ReactNode | null;

/**
 * Options for useContentCache hook.
 */
export type UseContentCacheOptions<TId extends string = string> = {
  /**
   * Function to resolve content by ID.
   * Called only when content is not already in cache.
   */
  resolveContent: ContentResolver<TId>;
  /**
   * Current valid IDs. Used to clean up stale cache entries.
   * When an ID is removed from this array, its cached content is deleted.
   */
  validIds: readonly TId[];
};

/**
 * Result from useContentCache hook.
 */
export type UseContentCacheResult<TId extends string = string> = {
  /**
   * Get cached content for an ID.
   * Returns the same ReactNode reference for the same ID.
   */
  getCachedContent: (id: TId) => React.ReactNode | null;
  /**
   * Clear all cached content.
   * Use when you need to force re-creation of all content.
   */
  clearCache: () => void;
};

/**
 * Hook for caching ReactNode content by ID.
 *
 * Ensures the same ReactNode reference is returned for the same ID,
 * preventing unnecessary component remounting when parent re-renders.
 *
 * @example
 * ```tsx
 * const { getCachedContent } = useContentCache({
 *   resolveContent: (id) => items.find(i => i.id === id)?.content ?? null,
 *   validIds: items.map(i => i.id),
 * });
 *
 * return items.map(item => (
 *   <div key={item.id}>{getCachedContent(item.id)}</div>
 * ));
 * ```
 */
export function useContentCache<TId extends string = string>(
  options: UseContentCacheOptions<TId>,
): UseContentCacheResult<TId> {
  const { resolveContent, validIds } = options;

  /**
   * Cache storage. Key: ID, Value: cached ReactNode.
   * Uses ref to persist across re-renders without triggering updates.
   */
  const cacheRef = React.useRef<Map<string, React.ReactNode>>(new Map());

  /**
   * Store resolveContent in a ref for stable getCachedContent function.
   * This allows getCachedContent to always use the latest resolver
   * without needing to be recreated.
   */
  const resolveContentRef = React.useRef(resolveContent);
  resolveContentRef.current = resolveContent;

  /**
   * Get or create cached content for an ID.
   * On first access, calls resolveContent and caches the result.
   * On subsequent accesses, returns the cached reference.
   */
  const getCachedContent = React.useCallback((id: TId): React.ReactNode | null => {
    const cached = cacheRef.current.get(id);
    if (cached !== undefined) {
      return cached;
    }

    const content = resolveContentRef.current(id);
    cacheRef.current.set(id, content);
    return content;
  }, []);

  /**
   * Clear all cached content.
   */
  const clearCache = React.useCallback((): void => {
    cacheRef.current.clear();
  }, []);

  /**
   * Clean up stale cache entries when validIds changes.
   * Removes entries for IDs that are no longer valid.
   */
  React.useEffect(() => {
    const currentValidIds = new Set<string>(validIds);
    cacheRef.current.forEach((_, id) => {
      if (!currentValidIds.has(id)) {
        cacheRef.current.delete(id);
      }
    });
  }, [validIds]);

  return { getCachedContent, clearCache };
}
