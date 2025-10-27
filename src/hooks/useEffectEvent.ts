/**
 * @file useEffectEvent hook - Stable event handler for Effects
 *
 * This hook allows you to extract event handlers from Effects without causing them to re-run.
 * The returned function is stable and can be safely used in effect dependencies.
 *
 * @see https://react.dev/learn/separating-events-from-effects#declaring-an-effect-event
 */
import * as React from "react";

/**
 * Extract event handlers from Effects to avoid unnecessary re-runs
 *
 * @example
 * ```tsx
 * function Component({ onEvent }) {
 *   const onEventHandler = useEffectEvent(onEvent);
 *
 *   React.useEffect(() => {
 *     // onEventHandler is stable, but always calls the latest onEvent
 *     const cleanup = subscribe(onEventHandler);
 *     return cleanup;
 *   }, []); // No need to include onEvent in dependencies
 * }
 * ```
 */
export function useEffectEvent<Args extends unknown[], Return>(
  fn: ((...args: Args) => Return) | undefined,
): (...args: Args) => Return | undefined {
  const ref = React.useRef<typeof fn>(fn);
  ref.current = fn;

  return React.useCallback((...args: Args): Return | undefined => {
    const currentFn = ref.current;
    if (currentFn) {
      return currentFn(...args);
    }
    return undefined;
  }, []);
}
