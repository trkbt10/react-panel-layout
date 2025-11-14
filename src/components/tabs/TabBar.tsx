/**
 * @file Tab bar with drag handles (generic, not panel-specific).
 */
import * as React from "react";
import type { TabBarRenderProps } from "../../modules/panels/state/types";
import { usePanelInteractions } from "../../modules/panels/interactions/InteractionsContext";
import { useElementComponentWrapper } from "../../hooks/useElementComponentWrapper";
import { TabBarTab } from "./TabBarTab";

export type TabBarProps = TabBarRenderProps & {
  /** Custom component for the tabbar container */
  component?: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }>;
  /** Custom element for the tabbar container */
  element?: React.ReactElement<React.HTMLAttributes<HTMLDivElement>>;
  /** Custom component for individual tabs */
  tabComponent?: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  /** Custom element factory for individual tabs */
  tabElement?: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => React.ReactElement;
  /** Request to add a new tab to this group */
  onAddTab?: (groupId: string) => void;
  /** Request to close/remove a tab */
  onCloseTab?: (groupId: string, tabId: string) => void;
};

const tabbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const spacerStyle: React.CSSProperties = {
  flex: "1 1 auto",
};

export const TabBar: React.FC<TabBarProps> = ({
  group,
  onClickTab,
  onStartDrag,
  rootRef,
  component: ContainerComponent,
  element,
  tabComponent: TabComponent,
  tabElement,
  onAddTab,
  onCloseTab,
}) => {
  const { isTabDragging, draggingTabId } = usePanelInteractions();
  const localRef = React.useRef<HTMLDivElement | null>(null);

  const setRefs = React.useCallback(
    (el: HTMLDivElement | null) => {
      localRef.current = el;
      if (!rootRef) {
        return;
      }
      if (typeof rootRef === "function") {
        rootRef(el);
        return;
      }
      try {
        // RefObject-like
        (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      } catch {
        // ignore
      }
    },
    [rootRef],
  );

  const handleKeyDown = React.useEffectEvent((e: React.KeyboardEvent<HTMLDivElement>) => {
    const root = localRef.current ?? (e.currentTarget as HTMLDivElement | null);
    if (!root) {
      return;
    }
    const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLElement[];
    if (tabs.length === 0) {
      return;
    }

    const focusTabAt = (index: number) => {
      const clamped = Math.max(0, Math.min(index, tabs.length - 1));
      const el = tabs[clamped];
      if (!el) {
        return;
      }
      el.focus();
    };

    const activeEl = document.activeElement as HTMLElement | null;
    const currentIndex = activeEl ? tabs.indexOf(activeEl) : tabs.findIndex((el) => el.getAttribute("data-tab-id") === group.activeTabId);

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = currentIndex >= 0 ? currentIndex + 1 : 0;
      focusTabAt(next >= tabs.length ? 0 : next);
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = currentIndex >= 0 ? currentIndex - 1 : tabs.length - 1;
      focusTabAt(prev < 0 ? tabs.length - 1 : prev);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      focusTabAt(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      focusTabAt(tabs.length - 1);
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const el = currentIndex >= 0 ? tabs[currentIndex] : null;
      const id = el?.getAttribute("data-tab-id") ?? null;
      if (id) {
        onClickTab(id);
      }
      return;
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      if (onCloseTab) {
        e.preventDefault();
        const el = currentIndex >= 0 ? tabs[currentIndex] : null;
        const id = el?.getAttribute("data-tab-id") ?? null;
        if (id) {
          onCloseTab(group.id, id);
        }
      }
      return;
    }

    const hasModifier = (e.ctrlKey ? 1 : 0) + (e.metaKey ? 1 : 0) > 0;
    const keyLower = typeof e.key === "string" ? e.key.toLowerCase() : "";
    if (hasModifier && keyLower === "t") {
      if (onAddTab) {
        e.preventDefault();
        onAddTab(group.id);
      }
      return;
    }
  });

  React.useEffect(() => {
    const root = localRef.current;
    if (!root) {
      return;
    }
    const active = root.querySelector(`[role="tab"][data-tab-id="${group.activeTabId}"]`) as HTMLElement | null;
    if (active === (document.activeElement as HTMLElement | null)) {
      return;
    }
    // Maintain roving focus: ensure active tab is in the natural focus if none inside has focus
    const containsFocus = root.contains(document.activeElement);
    if (!containsFocus && active) {
      active.focus();
    }
  }, [group.activeTabId]);

  const containerProps = {
    style: tabbarStyle,
    role: "tablist" as const,
    "data-tabbar": "true",
    "data-group-id": group.id,
    "data-dragging": isTabDragging ? "true" : "false",
    onKeyDown: handleKeyDown,
  };

  const Wrapper = useElementComponentWrapper({
    element,
    component: ContainerComponent,
  });

  const renderAddButton = (): React.ReactNode => {
    if (!onAddTab) {
      return null;
    }
    return (
      <button
        type="button"
        aria-label="Add tab"
        onClick={() => {
          onAddTab(group.id);
        }}
      >
        +
      </button>
    );
  };

  return (
    <Wrapper {...containerProps} ref={setRefs}>
      {group.tabs.map((tab, index) => (
        <TabBarTab
          key={`${group.id}:${tab.id}:${index}`}
          groupId={group.id}
          tab={tab}
          active={group.activeTabId === tab.id}
          dragging={draggingTabId === tab.id}
          onClickTab={onClickTab}
          onStartDrag={onStartDrag}
          onCloseTab={onCloseTab}
          tabComponent={TabComponent}
          tabElement={tabElement}
        />
      ))}
      <span style={spacerStyle} />
      {renderAddButton()}
    </Wrapper>
  );
};
