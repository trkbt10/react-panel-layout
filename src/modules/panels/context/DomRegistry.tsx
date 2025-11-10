/**
 * @file DOM registry for panel-system. React-first: components register their own refs
 * instead of global querySelectorAll scans.
 */
import * as React from "react";
import type { GroupId } from "../core/types";

export type RegisteredEls = {
  group: HTMLElement | null;
  tabbar: HTMLElement | null;
  content: HTMLElement | null;
};

export type DomRegistryContextValue = {
  setGroupEl: (groupId: GroupId, el: HTMLElement | null) => void;
  setTabbarEl: (groupId: GroupId, el: HTMLElement | null) => void;
  setContentEl: (groupId: GroupId, el: HTMLElement | null) => void;
  getAll: () => Map<GroupId, RegisteredEls>;
};

const DomRegistryContext = React.createContext<DomRegistryContextValue | null>(null);

export const useDomRegistry = (): DomRegistryContextValue => {
  const ctx = React.useContext(DomRegistryContext);
  if (!ctx) {
    throw new Error("useDomRegistry must be used within DomRegistryProvider");
  }
  return ctx;
};

export const DomRegistryProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const mapRef = React.useRef<Map<GroupId, RegisteredEls>>(new Map());

  const ensure = React.useCallback((groupId: GroupId): RegisteredEls => {
    const current = mapRef.current.get(groupId);
    if (current) {
      return current;
    }
    const next: RegisteredEls = { group: null, tabbar: null, content: null };
    mapRef.current.set(groupId, next);
    return next;
  }, []);

  const setGroupEl = React.useCallback(
    (groupId: GroupId, el: HTMLElement | null) => {
      const r = ensure(groupId);
      r.group = el;
      if (el === null) {
        const v = mapRef.current.get(groupId);
        const noOthers = v ? v.tabbar === null && v.content === null : false;
        if (noOthers) {
          mapRef.current.delete(groupId);
        }
      }
    },
    [ensure],
  );

  const setTabbarEl = React.useCallback(
    (groupId: GroupId, el: HTMLElement | null) => {
      const r = ensure(groupId);
      r.tabbar = el;
      if (el === null) {
        const v = mapRef.current.get(groupId);
        const noOthers = v ? v.group === null && v.content === null : false;
        if (noOthers) {
          mapRef.current.delete(groupId);
        }
      }
    },
    [ensure],
  );

  const setContentEl = React.useCallback(
    (groupId: GroupId, el: HTMLElement | null) => {
      const r = ensure(groupId);
      r.content = el;
      if (el === null) {
        const v = mapRef.current.get(groupId);
        const noOthers = v ? v.group === null && v.tabbar === null : false;
        if (noOthers) {
          mapRef.current.delete(groupId);
        }
      }
    },
    [ensure],
  );

  const getAll = React.useCallback(() => mapRef.current, []);

  const value = React.useMemo<DomRegistryContextValue>(() => ({ setGroupEl, setTabbarEl, setContentEl, getAll }), [setGroupEl, setTabbarEl, setContentEl, getAll]);

  return <DomRegistryContext.Provider value={value}>{children}</DomRegistryContext.Provider>;
};
