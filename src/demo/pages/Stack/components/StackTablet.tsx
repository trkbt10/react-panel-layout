/**
 * @file Stack Tablet demo - iPad Settings-style stacking sidebar
 * Each menu panel has its own header that stacks with the content.
 */
import * as React from "react";
import { useStackNavigation } from "../../../../modules/stack/useStackNavigation.js";
import { useStackSwipeInput } from "../../../../modules/stack/useStackSwipeInput.js";
import { StackContent } from "../../../../modules/stack/StackContent.js";
import type { StackPanel } from "../../../../modules/stack/types.js";
import styles from "./StackTablet.module.css";

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
    items: [
      { id: "name", icon: "📝", label: "Name" },
    ],
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

// Track exiting panels for exit animation
type ExitingPanel = {
  id: string;
  depth: number;
};

// Component for panels that are exiting (being popped)
type ExitingStackContentProps = {
  id: string;
  depth: number;
  onExitComplete: () => void;
  children: React.ReactNode;
};

const ExitingStackContent: React.FC<ExitingStackContentProps> = ({
  id,
  depth,
  onExitComplete,
  children,
}) => {
  return (
    <div
      className={styles.exitingPanel}
      data-stack-content={id}
      data-depth={depth}
      data-exiting="true"
      style={{ zIndex: depth }}
      onAnimationEnd={onExitComplete}
    >
      {children}
    </div>
  );
};

export const StackTablet: React.FC = () => {
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [exitingPanels, setExitingPanels] = React.useState<ExitingPanel[]>([]);
  const prevStackRef = React.useRef<ReadonlyArray<string>>([]);

  const navigation = useStackNavigation({
    panels,
    displayMode: "stack",
    transitionMode: "css",
  });

  const { isEdgeSwiping, progress } = useStackSwipeInput({
    containerRef: sidebarRef,
    navigation,
    edge: "left",
    edgeWidth: 20,
  });

  const stack = navigation.state.stack;
  const stackLength = stack.length;

  // Detect popped panels and add them to exiting list
  React.useEffect(() => {
    const prevStack = prevStackRef.current;
    if (prevStack.length > stack.length) {
      // Panels were popped - add them to exiting list
      const poppedPanels = prevStack.slice(stack.length).map((id, i) => ({
        id,
        depth: stack.length + i,
      }));
      setExitingPanels((prev) => [...prev, ...poppedPanels]);
    }
    prevStackRef.current = stack;
  }, [stack]);

  const handleAnimationEnd = React.useCallback((panelId: string) => {
    setExitingPanels((prev) => prev.filter((p) => p.id !== panelId));
  }, []);

  const handleMenuClick = (id: string) => {
    navigation.push(id as typeof panels[number]["id"]);
  };

  const handleBack = () => {
    navigation.go(-1);
  };

  const currentPanelId = navigation.currentPanelId;
  const currentDetail = detailContent[currentPanelId] ?? detailContent.root;

  return (
    <div className={styles.container}>
      {/* Sidebar with stacking menus - NO fixed header */}
      <aside className={styles.sidebar}>
        <div ref={sidebarRef} className={styles.sidebarContent}>
          {/* Render active stack panels */}
          {stack.map((id, depth) => {
            const menu = menus[id];
            if (menu == null) {
              return null;
            }
            const isTop = depth === stackLength - 1 && exitingPanels.length === 0;
            return (
              <StackContent
                key={id}
                id={id}
                depth={depth}
                isActive={isTop}
                displayMode="stack"
                transitionMode="css"
                navigationState={navigation.state}
                swipeProgress={isTop ? progress : undefined}
              >
                <MenuPanel
                  id={id}
                  title={menu.title}
                  parentTitle={menu.parentTitle}
                  items={menu.items}
                  onItemClick={handleMenuClick}
                  onBack={handleBack}
                  canGoBack={depth > 0}
                  currentPanelId={currentPanelId}
                />
              </StackContent>
            );
          })}
          {/* Render exiting panels (for pop animation) */}
          {exitingPanels.map(({ id, depth }) => {
            const menu = menus[id];
            if (menu == null) {
              return null;
            }
            return (
              <ExitingStackContent
                key={`exiting-${id}`}
                id={id}
                depth={depth}
                onExitComplete={() => handleAnimationEnd(id)}
              >
                <MenuPanel
                  id={id}
                  title={menu.title}
                  parentTitle={menu.parentTitle}
                  items={menu.items}
                  onItemClick={handleMenuClick}
                  onBack={handleBack}
                  canGoBack={depth > 0}
                  currentPanelId={currentPanelId}
                />
              </ExitingStackContent>
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
        {isEdgeSwiping ? <span>Swiping: {Math.round(progress * 100)}%</span> : null}
      </div>
    </div>
  );
};
