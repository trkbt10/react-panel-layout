/**
 * @file Registry for panel content instances.
 * Manages component lifecycle to preserve state across tab switches and panel moves.
 *
 * Architecture:
 * - Each panel has a stable wrapper element created outside React
 * - Content is portaled into the wrapper
 * - The wrapper is moved between containers using DOM manipulation
 * - React manages content lifecycle, DOM manages wrapper position
 */
import * as React from "react";
import { createPortal } from "react-dom";
import type { PanelId, GroupId, TabDefinition } from "../state/types";

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
 * Creates and manages a wrapper element for a panel's content.
 * The wrapper is moved between containers using DOM manipulation.
 */
const usePanelWrapper = (
  panelId: PanelId,
  containerElement: HTMLElement | null,
  isActive: boolean,
): HTMLDivElement | null => {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  // Create wrapper element once
  if (!wrapperRef.current) {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-panel-wrapper", panelId);
    wrapper.style.display = "contents";
    wrapperRef.current = wrapper;
  }

  const wrapper = wrapperRef.current;

  // Move wrapper to container and update visibility
  React.useLayoutEffect(() => {
    if (!wrapper) return;

    // Update visibility
    wrapper.style.display = isActive ? "contents" : "none";

    // Move to container if needed
    if (containerElement && wrapper.parentElement !== containerElement) {
      containerElement.appendChild(wrapper);
    }

    return () => {
      // Only remove if wrapper is in the DOM
      if (wrapper.parentElement) {
        wrapper.parentElement.removeChild(wrapper);
      }
    };
  }, [wrapper, containerElement, isActive]);

  return wrapper;
};

/**
 * Host component for a single panel's content.
 * Uses a portal to render content into a movable wrapper element.
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

    if (!wrapper) {
      return null;
    }

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
 * Manages panel content lifecycle to preserve state.
 * Creates rendered content once per panel and maintains it across moves.
 */
export const ContentRegistryProvider: React.FC<ContentRegistryProviderProps> = ({
  children,
  panels,
  placements,
}) => {
  const [containers, setContainers] = React.useState<Map<GroupId, HTMLElement>>(new Map());
  // Store rendered content per panel to preserve across moves
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

  // Get or create cached content for a panel
  const getOrCreateContent = (panelId: PanelId, tab: TabDefinition): React.ReactNode => {
    let content = contentCacheRef.current.get(panelId);
    if (!content) {
      content = tab.render(tab.id);
      contentCacheRef.current.set(panelId, content);
    }
    return content;
  };

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
