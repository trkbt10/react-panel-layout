/**
 * @file Stack entry point - Hierarchical navigation with swipe support
 * @packageDocumentation
 *
 * This is a subpath export entry point for `react-panel-layout/stack`.
 *
 * ## Overview
 * Stack provides iOS/iPadOS-style hierarchical navigation where panels stack
 * as users drill down into content. Supports swipe-to-go-back gestures.
 *
 * ## Installation
 * ```ts
 * import { useStackNavigation, SwipeStackOutlet } from "react-panel-layout/stack";
 * ```
 *
 * ## Basic Usage
 * ```tsx
 * const panels = [
 *   { id: 'list', title: 'Items', content: <ListPage /> },
 *   { id: 'detail', title: 'Detail', content: <DetailPage /> },
 * ];
 *
 * function App() {
 *   const { push, go, Outlet } = useStackNavigation({
 *     panels,
 *     displayMode: 'overlay',
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={() => push('detail')}>View Detail</button>
 *       <button onClick={() => go(-1)}>Back</button>
 *       <Outlet />
 *     </div>
 *   );
 * }
 * ```
 *
 * ## With Swipe Gestures (SwipeStackContent)
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const navigation = useStackNavigation({ panels, displayMode: 'overlay' });
 * const swipeInput = useStackSwipeInput({ containerRef, navigation });
 * const { rect } = useResizeObserver(containerRef);
 *
 * return (
 *   <div ref={containerRef} {...swipeInput.containerProps}>
 *     {panels.map((panel, index) => (
 *       <SwipeStackContent
 *         key={panel.id}
 *         id={panel.id}
 *         depth={index}
 *         navigationDepth={navigation.state.depth}
 *         isActive={navigation.currentPanelId === panel.id}
 *         inputState={swipeInput.inputState}
 *         containerSize={rect?.width ?? 0}
 *       >
 *         {panel.content}
 *       </SwipeStackContent>
 *     ))}
 *   </div>
 * );
 * ```
 */

// Hooks
export { useStackNavigation } from "../modules/stack/useStackNavigation.js";
export { useStackSwipeInput } from "../modules/stack/useStackSwipeInput.js";

// Components
export { StackContent } from "../modules/stack/StackContent.js";
export { SwipeStackContent } from "../modules/stack/SwipeStackContent.js";
export { SwipeStackOutlet } from "../modules/stack/SwipeStackOutlet.js";

// Types
export type {
  StackDisplayMode,
  StackTransitionMode,
  StackPanel,
  StackNavigationState,
  StackPanelProps,
  StackBackButtonProps,
  UseStackNavigationOptions,
  UseStackNavigationResult,
  UseStackSwipeInputOptions,
  UseStackSwipeInputResult,
  StackContentProps,
} from "../modules/stack/types.js";

export type { SwipeStackContentProps } from "../modules/stack/SwipeStackContent.js";
export type { SwipeStackOutletProps } from "../modules/stack/SwipeStackOutlet.js";
