/**
 * @file Stack Tablet demo - iPad Settings-style stacking sidebar
 * Each menu panel has its own header that stacks with the content.
 * Uses SwipeStackContent for direct DOM manipulation during swipe gestures.
 */
import * as React from "react";
import { useStackNavigation } from "../../../../modules/stack/useStackNavigation.js";
import { useStackSwipeInput } from "../../../../modules/stack/useStackSwipeInput.js";
import { SwipeStackContent } from "../../../../modules/stack/SwipeStackContent.js";
import type { StackPanel } from "../../../../modules/stack/types.js";
import styles from "./StackTablet.module.css";
import "../../../styles/stack-themes.css";

export type StackTheme = "ios" | "android" | "fluent" | "instant";

const THEME_CLASSES: Record<StackTheme, string> = {
  ios: "stack-theme-ios",
  android: "stack-theme-android",
  fluent: "stack-theme-fluent",
  instant: "stack-theme-instant",
};

// Animation durations matching CSS custom properties
const THEME_DURATIONS: Record<StackTheme, number> = {
  ios: 350,
  android: 400,
  fluent: 250,
  instant: 0,
};

const panels: StackPanel[] = [
  { id: "root", title: "Settings", content: null },
  { id: "general", title: "General", content: null },
  { id: "about", title: "About", content: null },
  { id: "name", title: "Name", content: null },
  { id: "software", title: "Software Update", content: null },
  { id: "storage", title: "Storage", content: null },
  { id: "display", title: "Display", content: null },
  { id: "sounds", title: "Sounds", content: null },
];

// Menu structure - each menu has items that can navigate deeper
type MenuItem = { id: string; icon: string; label: string };

const menus: Record<string, { title: string; parentTitle?: string; items: MenuItem[] }> = {
  root: {
    title: "Settings",
    items: [
      { id: "general", icon: "⚙️", label: "General" },
      { id: "display", icon: "☀️", label: "Display & Brightness" },
      { id: "sounds", icon: "🔔", label: "Sounds & Haptics" },
    ],
  },
  general: {
    title: "General",
    parentTitle: "Settings",
    items: [
      { id: "about", icon: "ℹ️", label: "About" },
      { id: "software", icon: "📲", label: "Software Update" },
      { id: "storage", icon: "💾", label: "iPad Storage" },
    ],
  },
  about: {
    title: "About",
    parentTitle: "General",
    items: [{ id: "name", icon: "📝", label: "Name" }],
  },
  name: {
    title: "Name",
    parentTitle: "About",
    items: [],
  },
  software: {
    title: "Software Update",
    parentTitle: "General",
    items: [],
  },
  storage: {
    title: "iPad Storage",
    parentTitle: "General",
    items: [],
  },
  display: {
    title: "Display & Brightness",
    parentTitle: "Settings",
    items: [],
  },
  sounds: {
    title: "Sounds & Haptics",
    parentTitle: "Settings",
    items: [],
  },
};

// Detail content for right panel
type DetailData = { title: string; items: Array<{ label: string; value: string }> };

const detailContent: Record<string, DetailData> = {
  root: {
    title: "Settings",
    items: [{ label: "Tip", value: "Select a menu item from the sidebar" }],
  },
  general: {
    title: "General",
    items: [{ label: "Info", value: "Configure general device settings" }],
  },
  about: {
    title: "About",
    items: [
      { label: "iOS Version", value: "17.2" },
      { label: "Model Name", value: "iPad Pro" },
      { label: "Model Number", value: "A2759" },
    ],
  },
  name: {
    title: "Name",
    items: [
      { label: "Device Name", value: "iPad" },
      { label: "Tip", value: "Tap to edit your device name" },
    ],
  },
  software: {
    title: "Software Update",
    items: [
      { label: "Current Version", value: "17.2" },
      { label: "Status", value: "Your software is up to date" },
    ],
  },
  storage: {
    title: "iPad Storage",
    items: [
      { label: "Used", value: "64 GB of 256 GB" },
      { label: "Available", value: "192 GB" },
    ],
  },
  display: {
    title: "Display & Brightness",
    items: [
      { label: "Brightness", value: "Auto" },
      { label: "True Tone", value: "On" },
      { label: "Night Shift", value: "Off" },
    ],
  },
  sounds: {
    title: "Sounds & Haptics",
    items: [
      { label: "Ringtone", value: "Reflection" },
      { label: "Text Tone", value: "Note" },
    ],
  },
};

type MenuPanelProps = {
  id: string;
  title: string;
  parentTitle?: string;
  items: MenuItem[];
  onItemClick: (id: string) => void;
  onBack: () => void;
  canGoBack: boolean;
  currentPanelId: string;
};

const getButtonClass = (isActive: boolean): string => {
  if (isActive) {
    return `${styles.menuButton} ${styles.menuButtonActive}`;
  }
  return styles.menuButton;
};

const MenuPanel: React.FC<MenuPanelProps> = ({
  title,
  parentTitle,
  items,
  onItemClick,
  onBack,
  canGoBack,
  currentPanelId,
}) => {
  const renderBackButton = (): React.ReactNode => {
    if (!canGoBack) {
      return null;
    }
    return (
      <button className={styles.panelBackButton} onClick={onBack}>
        ← {parentTitle}
      </button>
    );
  };

  const renderMenuList = (): React.ReactNode => (
    <ul className={styles.menuList}>
      {items.map((item) => {
        const isActive = currentPanelId === item.id;
        const buttonClass = getButtonClass(isActive);
        return (
          <li key={item.id} className={styles.menuItem}>
            <button className={buttonClass} onClick={() => onItemClick(item.id)}>
              <span className={styles.menuIcon}>{item.icon}</span>
              <span className={styles.menuLabel}>{item.label}</span>
              <span className={styles.menuChevron}>›</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const renderLeafContent = (): React.ReactNode => (
    <div className={styles.leafContent}>
      <p className={styles.leafText}>This is the deepest level for this menu.</p>
      <p className={styles.leafHint}>Swipe from left edge or tap back to return.</p>
    </div>
  );

  const renderContent = (): React.ReactNode => {
    if (items.length > 0) {
      return renderMenuList();
    }
    return renderLeafContent();
  };

  return (
    <div className={styles.menuPanel}>
      <header className={styles.panelHeader}>
        {renderBackButton()}
        <h2 className={styles.panelTitle}>{title}</h2>
      </header>
      {renderContent()}
    </div>
  );
};

type StackTabletProps = {
  theme?: StackTheme;
};

export const StackTablet: React.FC<StackTabletProps> = ({ theme = "ios" }) => {
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = React.useState<StackTheme>(theme);
  const [containerSize, setContainerSize] = React.useState(0);

  const navigation = useStackNavigation({
    panels,
    displayMode: "stack",
    transitionMode: "none", // Using direct DOM manipulation instead
  });

  const { isEdgeSwiping, progress, inputState, containerProps } = useStackSwipeInput({
    containerRef: sidebarRef,
    navigation,
    edge: "left",
    edgeWidth: 20,
  });

  // Track container size for SwipeStackContent
  React.useLayoutEffect(() => {
    const container = sidebarRef.current;
    if (!container) return;

    const updateSize = () => {
      setContainerSize(container.clientWidth);
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleMenuClick = (id: string) => {
    navigation.push(id as (typeof panels)[number]["id"]);
  };

  const handleBack = () => {
    navigation.go(-1);
  };

  const currentPanelId = navigation.currentPanelId;
  const currentDetail = detailContent[currentPanelId] ?? detailContent.root;

  // Get visible panels: active + behind (for swipe reveal) + exiting (for back animation)
  const { stack, depth } = navigation.state;

  // Track exiting panel when navigating back
  const [exitingPanelId, setExitingPanelId] = React.useState<string | null>(null);
  const prevDepthRef = React.useRef(depth);
  const prevStackRef = React.useRef<ReadonlyArray<string>>(stack);

  // Detect when we navigate back and need to animate out
  React.useLayoutEffect(() => {
    const prevDepth = prevDepthRef.current;
    const prevStack = prevStackRef.current;

    // Update refs
    prevDepthRef.current = depth;
    prevStackRef.current = stack;

    // Check if we went back (depth decreased)
    if (depth < prevDepth) {
      // The panel at prevDepth is exiting
      const exitingId = prevStack[prevDepth];
      if (exitingId != null) {
        setExitingPanelId(exitingId);

        // Clear exiting panel after animation completes
        const timeoutId = setTimeout(() => {
          setExitingPanelId(null);
        }, THEME_DURATIONS[selectedTheme]);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [depth, stack, selectedTheme]);

  const visiblePanelIds = React.useMemo(() => {
    const ids = [stack[depth]]; // Active panel
    if (depth > 0) {
      ids.unshift(stack[depth - 1]); // Behind panel
    }
    // Include exiting panel if not already in the list
    if (exitingPanelId != null && !ids.includes(exitingPanelId)) {
      ids.push(exitingPanelId);
    }
    return ids;
  }, [stack, depth, exitingPanelId]);

  const containerClassName = `${styles.container} ${THEME_CLASSES[selectedTheme]}`;

  return (
    <div className={containerClassName}>
      {/* Sidebar with stacking menus */}
      <aside className={styles.sidebar}>
        <div ref={sidebarRef} className={styles.sidebarContent} {...containerProps}>
          {visiblePanelIds.map((panelId) => {
            const menu = menus[panelId];
            if (menu == null) {
              return null;
            }

            const isExiting = panelId === exitingPanelId;
            // For exiting panels, use depth + 1 since they were previously at the active position
            const panelDepth = isExiting ? depth + 1 : stack.indexOf(panelId);
            const isActive = panelDepth === depth && !isExiting;

            return (
              <SwipeStackContent
                key={panelId}
                id={panelId}
                depth={panelDepth}
                navigationDepth={depth}
                isActive={isActive}
                inputState={inputState}
                containerSize={containerSize}
                animateOnMount={true}
                animationDuration={THEME_DURATIONS[selectedTheme]}
                displayMode="stack"
              >
                <MenuPanel
                  id={panelId}
                  title={menu.title}
                  parentTitle={menu.parentTitle}
                  items={menu.items}
                  onItemClick={handleMenuClick}
                  onBack={handleBack}
                  canGoBack={panelDepth > 0}
                  currentPanelId={currentPanelId}
                />
              </SwipeStackContent>
            );
          })}
        </div>
      </aside>

      {/* Detail panel (right side) */}
      <main className={styles.detail}>
        <header className={styles.detailHeader}>
          <h1 className={styles.detailTitle}>{currentDetail.title}</h1>
        </header>
        <div className={styles.detailBody}>
          <ul className={styles.detailList}>
            {currentDetail.items.map((item, index) => (
              <li key={index} className={styles.detailItem}>
                <span className={styles.detailLabel}>{item.label}</span>
                <span className={styles.detailValue}>{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* Debug info */}
      <div className={styles.debugInfo}>
        <span>Depth: {navigation.state.depth}</span>
        <span>Stack: [{navigation.state.stack.join(" → ")}]</span>
        <label className={styles.themeSelector}>
          Theme:
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value as StackTheme)}
          >
            <option value="ios">iOS</option>
            <option value="android">Android</option>
            <option value="fluent">Fluent</option>
            <option value="instant">Instant</option>
          </select>
        </label>
        {isEdgeSwiping ? <span>Swiping: {Math.round(progress * 100)}%</span> : null}
      </div>
    </div>
  );
};
