/**
 * @file Centralized panel interactions (DnD) using Context + reducer.
 * Handles content (panel area) split/move and tabbar reordering/cross-move.
 */
import * as React from "react";
import type { DropZone, GroupId, PanelId } from "../../modules/panels/types";
import { pickDropZone } from "./DropSuggestOverlay";

export type SuggestInfo = { rect: DOMRectReadOnly; zone: DropZone } | null;

type Phase =
  | { kind: "idle" }
  | { kind: "content"; startX: number; startY: number; fromGroupId: GroupId; tabId: PanelId }
  | { kind: "tab"; startX: number; startY: number; fromGroupId: GroupId; tabId: PanelId };

type State = {
  phase: Phase;
  suggest: SuggestInfo;
};

type Action =
  | { type: "START_CONTENT"; payload: { x: number; y: number; groupId: GroupId; tabId: PanelId } }
  | { type: "START_TAB"; payload: { x: number; y: number; groupId: GroupId; tabId: PanelId } }
  | { type: "SET_SUGGEST"; payload: SuggestInfo }
  | { type: "RESET" };

const initialState: State = { phase: { kind: "idle" }, suggest: null };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "START_CONTENT":
      return {
        phase: { kind: "content", startX: action.payload.x, startY: action.payload.y, fromGroupId: action.payload.groupId, tabId: action.payload.tabId },
        suggest: null,
      };
    case "START_TAB":
      return {
        phase: { kind: "tab", startX: action.payload.x, startY: action.payload.y, fromGroupId: action.payload.groupId, tabId: action.payload.tabId },
        suggest: null,
      };
    case "SET_SUGGEST":
      return { ...state, suggest: action.payload };
    case "RESET":
      return initialState;
    default: {
      // exhaustive
      return state;
    }
  }
};

export type InteractionsContextValue = {
  suggest: SuggestInfo;
  onStartContentDrag: (groupId: GroupId, tabId: PanelId, e: React.PointerEvent<HTMLDivElement>) => void;
  onStartTabDrag: (tabId: PanelId, groupId: GroupId, e: React.PointerEvent) => void;
  isTabDragging: boolean;
  draggingTabId: PanelId | null;
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
}>;

export const InteractionsProvider: React.FC<InteractionsProviderProps> = ({ containerRef, dragThresholdPx, onCommitContentDrop, onCommitTabDrop, children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  // Manage global pointer listeners for current phase; snapshot via deps on phase only
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
          dispatch({ type: "SET_SUGGEST", payload: null });
        }
        return;
      }

      if (phase.kind === "content") {
        const groups = Array.from(container.querySelectorAll<HTMLElement>("[data-group-id]"));
        const candidate = groups
          .map((el) => ({ el, rect: el.getBoundingClientRect() }))
          .find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
        if (!candidate) {
          dispatch({ type: "SET_SUGGEST", payload: null });
          return;
        }
        const zone = pickDropZone(candidate.rect, x, y);
        dispatch({ type: "SET_SUGGEST", payload: { rect: candidate.rect, zone } });
        return;
      }

      if (phase.kind === "tab") {
        // While dragging a tab, show split suggest over content areas
        const contents = Array.from(container.querySelectorAll<HTMLElement>("[data-dnd-zone='content']"));
        const candidate = contents
          .map((el) => ({ el, rect: el.getBoundingClientRect() }))
          .find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
        if (!candidate) {
          dispatch({ type: "SET_SUGGEST", payload: null });
          return;
        }
        const zone = pickDropZone(candidate.rect, x, y);
        dispatch({ type: "SET_SUGGEST", payload: { rect: candidate.rect, zone } });
      }
    };

    const onUp = (ev: PointerEvent): void => {
      const container = containerRef.current;
      const snapshot = state;
      dispatch({ type: "RESET" });
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
        const groups = Array.from(container.querySelectorAll<HTMLElement>("[data-group-id]"));
        const hit = groups
          .map((el) => ({ el, rect: el.getBoundingClientRect() }))
          .find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
        if (!hit) {
          return;
        }
        const targetGroupId = (hit.el.getAttribute("data-group-id") as GroupId) ?? null;
        if (!targetGroupId) {
          return;
        }
        const zone = pickDropZone(hit.rect, x, y);
        onCommitContentDrop({ fromGroupId: snapshot.phase.fromGroupId, tabId: snapshot.phase.tabId, targetGroupId, zone });
        return;
      }

      if (snapshot.phase.kind === "tab") {
        // Prefer drop into tabbar if hovered, otherwise allow drop into content for split
        const tabbars = Array.from(container.querySelectorAll<HTMLElement>("[data-tabbar='true']"));
        const tabbarHit = tabbars
          .map((el) => ({ el, rect: el.getBoundingClientRect() }))
          .find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
        if (tabbarHit) {
          const targetGroupId = (tabbarHit.el.getAttribute("data-group-id") as GroupId) ?? null;
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
        const contents = Array.from(container.querySelectorAll<HTMLElement>("[data-dnd-zone='content']"));
        const contentHit = contents
          .map((el) => ({ el, rect: el.getBoundingClientRect() }))
          .find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
        if (contentHit) {
          const gidAttr = contentHit.el.closest('[data-group-id]') as HTMLElement | null;
          const targetGroupId = (gidAttr?.getAttribute("data-group-id") as GroupId) ?? null;
          if (!targetGroupId) {
            return;
          }
          const zone = pickDropZone(contentHit.rect, x, y);
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
  }, [state.phase, containerRef, dragThresholdPx, onCommitContentDrop, onCommitTabDrop]);

  const value = React.useMemo<InteractionsContextValue>(() => ({
    suggest: state.suggest,
    isTabDragging: state.phase.kind === "tab",
    draggingTabId: state.phase.kind === "tab" ? state.phase.tabId : null,
    onStartContentDrag: (groupId, tabId, e) => {
      if (e.button !== 0) {
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      dispatch({ type: "START_CONTENT", payload: { x: e.clientX, y: e.clientY, groupId, tabId } });
    },
    onStartTabDrag: (tabId, groupId, e) => {
      if (e.button !== 0) {
        return;
      }
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      dispatch({ type: "START_TAB", payload: { x: e.clientX, y: e.clientY, groupId, tabId } });
    },
  }), [state.suggest]);

  return <InteractionsContext.Provider value={value}>{children}</InteractionsContext.Provider>;
};
