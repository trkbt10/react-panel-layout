/**
 * @file Centralized panel interactions (DnD) using Context + reducer.
 * Handles content (panel area) split/move and tabbar reordering/cross-move.
 */
import * as React from "react";
import type { DropZone, GroupId, PanelId } from "../state/types";
import { pickDropZone } from "./dnd";
import { useDomRegistry } from "../dom/DomRegistry";
import { createAction, createActionHandlerMap } from "../../../utils/typedActions";
import { useEffectEvent } from "../../../hooks/useEffectEvent";

export type SuggestInfo = { rect: DOMRectReadOnly; zone: DropZone } | null;

// Cached layout data for drag operations
type LayoutCache = {
  groups: Array<{ gid: GroupId; el: HTMLElement; rect: DOMRect }>;
  tabbars: Array<{ gid: GroupId; el: HTMLElement; rect: DOMRect }>;
  contents: Array<{ gid: GroupId; el: HTMLElement; rect: DOMRect }>;
};

type Phase =
  | { kind: "idle" }
  | {
    kind: "content";
    startX: number;
    startY: number;
    fromGroupId: GroupId;
    tabId: PanelId;
    cache: LayoutCache;
  }
  | {
    kind: "tab";
    startX: number;
    startY: number;
    fromGroupId: GroupId;
    tabId: PanelId;
    cache: LayoutCache;
  };

type State = {
  phase: Phase;
  suggest: SuggestInfo;
  pointer: { x: number; y: number } | null;
  tabbarHover: { groupId: GroupId; index: number; rect: DOMRectReadOnly; insertX: number } | null;
};

const initialState: State = { phase: { kind: "idle" }, suggest: null, pointer: null, tabbarHover: null };

const actions = {
  startContent: createAction(
    "START_CONTENT",
    (payload: { x: number; y: number; groupId: GroupId; tabId: PanelId; cache: LayoutCache }) => payload,
  ),
  startTab: createAction(
    "START_TAB",
    (payload: { x: number; y: number; groupId: GroupId; tabId: PanelId; cache: LayoutCache }) => payload,
  ),
  setSuggest: createAction("SET_SUGGEST", (payload: SuggestInfo) => payload),
  setPointer: createAction("SET_POINTER", (payload: { x: number; y: number } | null) => payload),
  setTabbarHover: createAction(
    "SET_TABBAR_HOVER",
    (payload: { groupId: GroupId; index: number; rect: DOMRectReadOnly; insertX: number } | null) => payload,
  ),
  reset: createAction("RESET"),
} as const;

const reducerHandlers = createActionHandlerMap<State, typeof actions, void>(actions, {
  startContent: (_state, action) => ({
    phase: {
      kind: "content",
      startX: action.payload.x,
      startY: action.payload.y,
      fromGroupId: action.payload.groupId,
      tabId: action.payload.tabId,
      cache: action.payload.cache,
    },
    suggest: null,
    pointer: null,
    tabbarHover: null,
  }),
  startTab: (_state, action) => ({
    phase: {
      kind: "tab",
      startX: action.payload.x,
      startY: action.payload.y,
      fromGroupId: action.payload.groupId,
      tabId: action.payload.tabId,
      cache: action.payload.cache,
    },
    suggest: null,
    pointer: null,
    tabbarHover: null,
  }),
  setSuggest: (state, action) => ({ ...state, suggest: action.payload }),
  setPointer: (state, action) => ({ ...state, pointer: action.payload }),
  setTabbarHover: (state, action) => ({ ...state, tabbarHover: action.payload }),
  reset: () => initialState,
});

type ReducerAction = ReturnType<(typeof actions)[keyof typeof actions]>;

const reducer = (state: State, action: ReducerAction): State => {
  const handler = reducerHandlers[action.type];
  if (!handler) {
    return state;
  }
  return handler(state, action, undefined);
};

export type InteractionsContextValue = {
  suggest: SuggestInfo;
  onStartContentDrag: (groupId: GroupId, tabId: PanelId, e: React.PointerEvent<HTMLDivElement>) => void;
  onStartTabDrag: (tabId: PanelId, groupId: GroupId, e: React.PointerEvent) => void;
  isTabDragging: boolean;
  draggingTabId: PanelId | null;
  dragPointer: { x: number; y: number } | null;
  tabbarHover: { groupId: GroupId; index: number; rect: DOMRectReadOnly; insertX: number } | null;
};

const InteractionsContext = React.createContext<InteractionsContextValue | null>(null);

export const usePanelInteractions = (): InteractionsContextValue => {
  const ctx = React.useContext(InteractionsContext);
  if (!ctx) {
    throw new Error("usePanelInteractions must be used within InteractionsProvider");
  }
  return ctx;
};

export type InteractionsProviderProps = React.PropsWithChildren<{
  containerRef: React.RefObject<HTMLDivElement | null>;
  dragThresholdPx: number;
  onCommitContentDrop: (payload: { fromGroupId: GroupId; tabId: PanelId; targetGroupId: GroupId; zone: DropZone }) => void;
  onCommitTabDrop: (payload: { fromGroupId: GroupId; tabId: PanelId; targetGroupId: GroupId; targetIndex: number }) => void;
  isContentZoneAllowed?: (payload: { targetGroupId: GroupId; zone: DropZone }) => boolean;
}>;

export const InteractionsProvider: React.FC<InteractionsProviderProps> = ({
  containerRef,
  dragThresholdPx,
  onCommitContentDrop,
  onCommitTabDrop,
  isContentZoneAllowed,
  children,
}) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const dom = useDomRegistry();

  // Helper to capture current layout state
  const captureLayout = React.useCallback((): LayoutCache => {
    const all = Array.from(dom.getAll().entries());

    const groups = all
      .map(([gid, els]) => ({ gid, el: els.content ?? els.group }))
      .filter((it): it is { gid: GroupId; el: HTMLElement } => Boolean(it.el))
      .map((it) => ({ ...it, rect: it.el.getBoundingClientRect() }));

    const tabbars = all
      .map(([gid, els]) => ({ gid, el: els.tabbar }))
      .filter((it): it is { gid: GroupId; el: HTMLElement } => Boolean(it.el))
      .map((it) => ({ ...it, rect: it.el.getBoundingClientRect() }));

    const contents = all
      .map(([gid, els]) => ({ gid, el: els.content ?? els.group }))
      .filter((it): it is { gid: GroupId; el: HTMLElement } => Boolean(it.el))
      .map((it) => ({ ...it, rect: it.el.getBoundingClientRect() }));

    return { groups, tabbars, contents };
  }, [dom]);

  const onMove = useEffectEvent((ev: PointerEvent) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const x = ev.clientX;
    const y = ev.clientY;
    const phase = state.phase;
    if (phase.kind === "idle") {
      return;
    }
    const dx = Math.abs(x - phase.startX);
    const dy = Math.abs(y - phase.startY);
    if (dx < dragThresholdPx && dy < dragThresholdPx) {
      if (state.phase.kind === "content") {
        dispatch(actions.setSuggest(null));
      }
      dispatch(actions.setPointer(null));
      dispatch(actions.setTabbarHover(null));
      return;
    }
    dispatch(actions.setPointer({ x, y }));

    if (phase.kind === "content") {
      // Use cached groups
      const candidate = phase.cache.groups
        .find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);

      if (!candidate) {
        dispatch(actions.setSuggest(null));
        return;
      }
      const zone = pickDropZone(candidate.rect, x, y);
      if (isContentZoneAllowed && !isContentZoneAllowed({ targetGroupId: candidate.gid, zone })) {
        dispatch(actions.setSuggest(null));
        return;
      }
      dispatch(actions.setSuggest({ rect: candidate.rect, zone }));
      return;
    }

    if (phase.kind === "tab") {
      // Use cached tabbars
      const tabbarHit = phase.cache.tabbars
        .find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);

      if (tabbarHit) {
        // We still need to query buttons for exact insertion index, but we can optimize this too if needed.
        // For now, querying buttons inside the hit tabbar is acceptable as it's much smaller scope than global.
        // Optimization: We could cache button rects too, but they might change if tabs reorder during drag (if we implemented live reorder).
        // Assuming no live reorder for now as per original code.
        const tabButtons = Array.from(tabbarHit.el.querySelectorAll<HTMLButtonElement>("[role='tab']"));
        const btnRects = tabButtons.map((b) => b.getBoundingClientRect());
        const centers = btnRects.map((r) => r.left + r.width / 2);
        const firstIdx = centers.findIndex((c) => x < c);
        const targetIndex = firstIdx === -1 ? centers.length : firstIdx;

        const computeInsertX = (): number => {
          if (btnRects.length === 0) {
            return tabbarHit.rect.left + 8;
          }
          if (targetIndex === 0) {
            return btnRects[0].left;
          }
          if (targetIndex === btnRects.length) {
            return btnRects[btnRects.length - 1].right;
          }
          return (btnRects[targetIndex - 1].right + btnRects[targetIndex].left) / 2;
        };
        const insertX = computeInsertX();
        dispatch(actions.setTabbarHover({ groupId: tabbarHit.gid, index: targetIndex, rect: tabbarHit.rect, insertX }));
      } else {
        dispatch(actions.setTabbarHover(null));
      }

      // Use cached contents for split/move
      const candidate = phase.cache.contents
        .find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);

      if (!candidate) {
        dispatch(actions.setSuggest(null));
        return;
      }
      const zone = pickDropZone(candidate.rect, x, y);
      if (isContentZoneAllowed && !isContentZoneAllowed({ targetGroupId: candidate.gid, zone })) {
        dispatch(actions.setSuggest(null));
        return;
      }
      dispatch(actions.setSuggest({ rect: candidate.rect, zone }));
    }
  });

  const onUp = useEffectEvent((ev: PointerEvent) => {
    const container = containerRef.current;
    const snapshot = state;
    dispatch(actions.reset());
    if (!container) {
      return;
    }
    const x = ev.clientX;
    const y = ev.clientY;
    if (snapshot.phase.kind === "idle") {
      return;
    }
    const dx = Math.abs(x - snapshot.phase.startX);
    const dy = Math.abs(y - snapshot.phase.startY);
    if (dx < dragThresholdPx && dy < dragThresholdPx) {
      return;
    }

    if (snapshot.phase.kind === "content") {
      const hit = snapshot.phase.cache.groups
        .find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);

      if (!hit) {
        return;
      }
      const targetGroupId = hit.gid ?? null;
      if (!targetGroupId) {
        return;
      }
      const zone = pickDropZone(hit.rect, x, y);
      if (isContentZoneAllowed && !isContentZoneAllowed({ targetGroupId: targetGroupId, zone })) {
        return;
      }
      onCommitContentDrop({ fromGroupId: snapshot.phase.fromGroupId, tabId: snapshot.phase.tabId, targetGroupId, zone });
      return;
    }

    if (snapshot.phase.kind === "tab") {
      const tabbarHit = snapshot.phase.cache.tabbars
        .find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);

      if (tabbarHit) {
        const targetGroupId = tabbarHit.gid;
        if (!targetGroupId) {
          return;
        }
        const tabButtons = Array.from(tabbarHit.el.querySelectorAll<HTMLButtonElement>("[role='tab']"));
        const centers = tabButtons.map((btn) => {
          const r = btn.getBoundingClientRect();
          return r.left + r.width / 2;
        });
        const firstIdx = centers.findIndex((c) => x < c);
        const targetIndex = firstIdx === -1 ? centers.length : firstIdx;
        onCommitTabDrop({ fromGroupId: snapshot.phase.fromGroupId, tabId: snapshot.phase.tabId, targetGroupId, targetIndex });
        return;
      }

      const contentHit = snapshot.phase.cache.contents
        .find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);

      if (contentHit) {
        const targetGroupId = contentHit.gid ?? null;
        if (!targetGroupId) {
          return;
        }
        const zone = pickDropZone(contentHit.rect, x, y);
        if (isContentZoneAllowed && !isContentZoneAllowed({ targetGroupId, zone })) {
          return;
        }
        onCommitContentDrop({ fromGroupId: snapshot.phase.fromGroupId, tabId: snapshot.phase.tabId, targetGroupId, zone });
      }
    }
  });

  const onCancel = useEffectEvent(() => {
    dispatch(actions.reset());
  });

  React.useEffect(() => {
    if (state.phase.kind === "idle") {
      return;
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    window.addEventListener("pointercancel", onCancel, { once: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [state.phase.kind]);

  const onStartContentDrag = React.useCallback((groupId: GroupId, tabId: PanelId, e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) {
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    const cache = captureLayout();
    dispatch(actions.startContent({ x: e.clientX, y: e.clientY, groupId, tabId, cache }));
  }, [captureLayout]);

  const onStartTabDrag = React.useCallback((tabId: PanelId, groupId: GroupId, e: React.PointerEvent) => {
    if (e.button !== 0) {
      return;
    }
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const cache = captureLayout();
    dispatch(actions.startTab({ x: e.clientX, y: e.clientY, groupId, tabId, cache }));
  }, [captureLayout]);

  const value = React.useMemo<InteractionsContextValue>(() => ({
    suggest: state.suggest,
    isTabDragging: state.phase.kind === "tab",
    draggingTabId: state.phase.kind === "tab" ? state.phase.tabId : null,
    dragPointer: state.pointer,
    tabbarHover: state.tabbarHover,
    onStartContentDrag,
    onStartTabDrag,
  }), [state.suggest, state.pointer, state.tabbarHover, state.phase, onStartContentDrag, onStartTabDrag]);

  return <InteractionsContext.Provider value={value}>{children}</InteractionsContext.Provider>;
};
