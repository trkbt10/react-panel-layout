/**
 * @file Registry for panel content instances.
 * Manages component lifecycle to preserve state across tab switches and panel moves.
 *
 * ## Architecture
 *
 * This module solves the problem of preserving React component state when panels
 * move between different container elements (groups).
 *
 * ### The Problem
 * React portals remount their content when the container element changes.
 * This is React's intentional behavior, but it causes state loss when panels move.
 *
 * ### The Solution
 * 1. Create a stable wrapper element per panel (outside React's tree management)
 * 2. Use createPortal to render React content INTO the wrapper
 * 3. Move the wrapper between containers using appendChild
 *
 * This works because:
 * - React only manages content INSIDE the wrapper (via portal)
 * - React doesn't track the wrapper's position in DOM
 * - Moving the wrapper doesn't trigger React reconciliation
 *
 * ### DOM API Usage
 * - document.createElement: Creates wrapper element (once per panel)
 * - appendChild: Moves wrapper to target container
 * - removeChild: Cleans up wrapper on unmount
 *
 * These are the minimum DOM APIs required. React features handle everything else.
 */
import * as React from "react";
import { createPortal } from "react-dom";
import type { PanelId, GroupId, TabDefinition } from "../state/types";
import { useIsomorphicLayoutEffect } from "../../../hooks/useIsomorphicLayoutEffect";

type PanelPlacement = {
  groupId: GroupId;
  isActive: boolean;
};

type ContentRegistryContextValue = {
  registerContentContainer: (groupId: GroupId, element: HTMLElement | null) => void;
};

const ContentRegistryContext = React.createContext<ContentRegistryContextValue | null>(null);

export const useContentRegistry = (): ContentRegistryContextValue => {
  const ctx = React.useContext(ContentRegistryContext);
  if (!ctx) {
    throw new Error("useContentRegistry must be used within ContentRegistryProvider");
  }
  return ctx;
};

/**
 * Creates a wrapper element for panel content.
 * This element lives outside React's tree management so it can be moved freely.
 */
const createPanelWrapper = (panelId: PanelId): HTMLDivElement => {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-panel-wrapper", panelId);
  wrapper.style.display = "contents";
  return wrapper;
};

/**
 * Hook to manage wrapper element lifecycle and positioning.
 *
 * Uses React.useState for lazy initialization (wrapper created once).
 * Uses useIsomorphicLayoutEffect for DOM manipulation (SSR-safe).
 */
const usePanelWrapper = (
  panelId: PanelId,
  containerElement: HTMLElement | null,
  isActive: boolean,
): HTMLDivElement => {
  // Create wrapper once using React's lazy state initialization
  const [wrapper] = React.useState(() => createPanelWrapper(panelId));

  // Manage wrapper position and visibility
  useIsomorphicLayoutEffect(() => {
    wrapper.style.display = isActive ? "contents" : "none";

    if (containerElement && wrapper.parentElement !== containerElement) {
      containerElement.appendChild(wrapper);
    }

    return () => {
      wrapper.parentElement?.removeChild(wrapper);
    };
  }, [wrapper, containerElement, isActive]);

  return wrapper;
};

/**
 * Host component for panel content.
 * Uses createPortal to render React content into a stable wrapper element.
 */
type PanelContentHostProps = {
  panelId: PanelId;
  content: React.ReactNode;
  placement: PanelPlacement | null;
  containerElement: HTMLElement | null;
};

const PanelContentHost: React.FC<PanelContentHostProps> = React.memo(
  ({ panelId, content, placement, containerElement }) => {
    const isActive = placement?.isActive ?? false;
    const wrapper = usePanelWrapper(panelId, containerElement, isActive);

    // Portal renders React content INTO the wrapper
    // React manages content lifecycle, not wrapper position
    return createPortal(
      <React.Activity mode={isActive ? "visible" : "hidden"}>
        {content}
      </React.Activity>,
      wrapper,
    );
  },
);
PanelContentHost.displayName = "PanelContentHost";

type ContentRegistryProviderProps = React.PropsWithChildren<{
  panels: Record<PanelId, TabDefinition>;
  placements: Record<PanelId, PanelPlacement>;
}>;

/**
 * Provider that manages panel content lifecycle.
 * Caches rendered content per panel to preserve React element identity.
 */
export const ContentRegistryProvider: React.FC<ContentRegistryProviderProps> = ({
  children,
  panels,
  placements,
}) => {
  const [containers, setContainers] = React.useState<Map<GroupId, HTMLElement>>(new Map());
  const contentCacheRef = React.useRef<Map<PanelId, React.ReactNode>>(new Map());

  const registerContentContainer = React.useCallback((groupId: GroupId, element: HTMLElement | null): void => {
    setContainers((prev) => {
      const next = new Map(prev);
      if (element) {
        next.set(groupId, element);
      } else {
        next.delete(groupId);
      }
      return next;
    });
  }, []);

  const value = React.useMemo<ContentRegistryContextValue>(
    () => ({ registerContentContainer }),
    [registerContentContainer],
  );

  const getOrCreateContent = React.useCallback((panelId: PanelId, tab: TabDefinition): React.ReactNode => {
    const cached = contentCacheRef.current.get(panelId);
    if (cached) {
      return cached;
    }
    const newContent = tab.render(tab.id);
    contentCacheRef.current.set(panelId, newContent);
    return newContent;
  }, []);

  const panelIds = Object.keys(panels);

  return (
    <ContentRegistryContext.Provider value={value}>
      {children}
      {panelIds.map((panelId) => {
        const tab = panels[panelId];
        if (!tab) {
          return null;
        }
        const placement = placements[panelId] ?? null;
        const containerElement = placement ? containers.get(placement.groupId) ?? null : null;
        const content = getOrCreateContent(panelId, tab);
        return (
          <PanelContentHost
            key={panelId}
            panelId={panelId}
            content={content}
            placement={placement}
            containerElement={containerElement}
          />
        );
      })}
    </ContentRegistryContext.Provider>
  );
};
