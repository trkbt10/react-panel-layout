/**
 * @file Centralized panel interactions (DnD) using Context + reducer.
 * Handles content (panel area) split/move and tabbar reordering/cross-move.
 */
import * as React from "react";
import type { DropZone, GroupId, PanelId } from "../state/types";
import { pickDropZone } from "./dnd";
import { useDomRegistry } from "../dom/DomRegistry";
import { createAction, createActionHandlerMap } from "../../../utils/typedActions";

export type SuggestInfo = { rect: DOMRectReadOnly; zone: DropZone } | null;

type Phase =
  | { kind: "idle" }
  | { kind: "content"; startX: number; startY: number; fromGroupId: GroupId; tabId: PanelId }
  | { kind: "tab"; startX: number; startY: number; fromGroupId: GroupId; tabId: PanelId };

type State = {
  phase: Phase;
  suggest: SuggestInfo;
  pointer: { x: number; y: number } | null;
  tabbarHover: { groupId: GroupId; index: number; rect: DOMRectReadOnly; insertX: number } | null;
};

const initialState: State = { phase: { kind: "idle" }, suggest: null, pointer: null, tabbarHover: null };

const actions = {
  startContent: createAction("START_CONTENT", (payload: { x: number; y: number; groupId: GroupId; tabId: PanelId }) => payload),
  startTab: createAction("START_TAB", (payload: { x: number; y: number; groupId: GroupId; tabId: PanelId }) => payload),
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
    phase: { kind: "content", startX: action.payload.x, startY: action.payload.y, fromGroupId: action.payload.groupId, tabId: action.payload.tabId },
    suggest: null,
    pointer: null,
    tabbarHover: null,
  }),
  startTab: (_state, action) => ({
    phase: { kind: "tab", startX: action.payload.x, startY: action.payload.y, fromGroupId: action.payload.groupId, tabId: action.payload.tabId },
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

  React.useEffect(() => {
    if (state.phase.kind === "idle") {
      return;
    }
    const onMove = (ev: PointerEvent): void => {
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
        const groups = Array.from(dom.getAll().entries())
          .map(([gid, els]) => ({ gid, el: els.content ?? els.group }))
          .filter((it): it is { gid: GroupId; el: HTMLElement } => Boolean(it.el));
        const candidate = groups
          .map((g) => ({ gid: g.gid, el: g.el, rect: g.el.getBoundingClientRect() }))
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
        // Compute tabbar hover for reorder/cross-group using registered refs
        const tabbars = Array.from(dom.getAll().entries())
          .map(([gid, els]) => ({ gid, el: els.tabbar }))
          .filter((it): it is { gid: GroupId; el: HTMLElement } => Boolean(it.el));
        const tabbarHit = tabbars
          .map((t) => ({ gid: t.gid, el: t.el, rect: t.el.getBoundingClientRect() }))
          .find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
        if (tabbarHit) {
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
        // Compute content suggest for split/move using registered refs
        const contents = Array.from(dom.getAll().entries())
          .map(([gid, els]) => ({ gid, el: els.content ?? els.group }))
          .filter((it): it is { gid: GroupId; el: HTMLElement } => Boolean(it.el));
        const candidate = contents
          .map((c) => ({ gid: c.gid, el: c.el, rect: c.el.getBoundingClientRect() }))
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
    };
    const onUp = (ev: PointerEvent): void => {
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
        const groups = Array.from(dom.getAll().entries())
          .map(([gid, els]) => ({ gid, el: els.content ?? els.group }))
          .filter((it): it is { gid: GroupId; el: HTMLElement } => Boolean(it.el));
        const hit = groups
          .map((g) => ({ gid: g.gid, el: g.el, rect: g.el.getBoundingClientRect() }))
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
        const tabbars = Array.from(dom.getAll().entries())
          .map(([gid, els]) => ({ gid, el: els.tabbar }))
          .filter((it): it is { gid: GroupId; el: HTMLElement } => Boolean(it.el));
        const tabbarHit = tabbars
          .map((t) => ({ gid: t.gid, el: t.el, rect: t.el.getBoundingClientRect() }))
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
        const contents = Array.from(dom.getAll().entries())
          .map(([gid, els]) => ({ gid, el: els.content ?? els.group }))
          .filter((it): it is { gid: GroupId; el: HTMLElement } => Boolean(it.el));
        const contentHit = contents
          .map((c) => ({ gid: c.gid, el: c.el, rect: c.el.getBoundingClientRect() }))
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
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [state.phase, containerRef, dragThresholdPx, onCommitContentDrop, onCommitTabDrop, dom, isContentZoneAllowed]);

  const value = React.useMemo<InteractionsContextValue>(() => ({
    suggest: state.suggest,
    isTabDragging: state.phase.kind === "tab",
    draggingTabId: state.phase.kind === "tab" ? state.phase.tabId : null,
    dragPointer: state.pointer,
    tabbarHover: state.tabbarHover,
    onStartContentDrag: (groupId, tabId, e) => {
      if (e.button !== 0) {
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      dispatch(actions.startContent({ x: e.clientX, y: e.clientY, groupId, tabId }));
    },
    onStartTabDrag: (tabId, groupId, e) => {
      if (e.button !== 0) {
        return;
      }
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      dispatch(actions.startTab({ x: e.clientX, y: e.clientY, groupId, tabId }));
    },
  }), [state.suggest, state.pointer, state.tabbarHover, state.phase]);

  return <InteractionsContext.Provider value={value}>{children}</InteractionsContext.Provider>;
};
