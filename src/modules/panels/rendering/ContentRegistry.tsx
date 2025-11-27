/**
 * @file Registry for panel content instances.
 * Manages component lifecycle to preserve state across tab switches and panel moves.
 *
 * Architecture:
 * - Panel contents are rendered once via React and cached
 * - Each panel has a stable wrapper element managed outside React's tree
 * - The wrapper is moved between containers using DOM APIs
 * - This hybrid approach is necessary because React portals remount on container change
 * - React.Activity controls visibility without unmounting
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
 * Creates a stable wrapper element for panel content.
 * The wrapper is created once and reused across the component's lifetime.
 *
 * Note: This uses DOM API to create an element outside React's tree.
 * This is necessary because React portals remount when container changes.
 */
const createPanelWrapper = (panelId: PanelId): HTMLDivElement => {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-panel-wrapper", panelId);
  wrapper.style.display = "contents";
  return wrapper;
};

/**
 * Manages wrapper element lifecycle and positioning.
 * Uses DOM APIs to move the wrapper between containers without React remount.
 */
const usePanelWrapper = (
  panelId: PanelId,
  containerElement: HTMLElement | null,
  isActive: boolean,
): HTMLDivElement => {
  // Create wrapper element once using lazy initialization
  const [wrapper] = React.useState(() => createPanelWrapper(panelId));

  // Move wrapper to container and manage visibility
  React.useLayoutEffect(() => {
    // Update visibility via CSS
    wrapper.style.display = isActive ? "contents" : "none";

    // Move to target container if different from current parent
    if (containerElement && wrapper.parentElement !== containerElement) {
      containerElement.appendChild(wrapper);
    }

    // Cleanup: remove wrapper from DOM when component unmounts
    return () => {
      wrapper.parentElement?.removeChild(wrapper);
    };
  }, [wrapper, containerElement, isActive]);

  return wrapper;
};

/**
 * Host component for a single panel's content.
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

    // Use React portal to render content into the stable wrapper
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
  // Store rendered content per panel to preserve React element identity
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

  /**
   * Gets cached content or creates and caches new content.
   * Content is created once per panel and reused to preserve React element identity.
   */
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
