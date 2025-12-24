/**
 * @file Stack Tablet demo - iPad Settings-style stacking sidebar
 * Each menu panel has its own header that stacks with the content.
 */
import * as React from "react";
import { useStackNavigation } from "../../../../modules/stack/useStackNavigation.js";
import { useStackSwipeInput } from "../../../../modules/stack/useStackSwipeInput.js";
import {
  useStackAnimationState,
  type PanelAnimationPhase,
} from "../../../../modules/stack/useStackAnimationState.js";
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

// Animated panel wrapper
type AnimatedStackPanelProps = {
  id: string;
  depth: number;
  phase: PanelAnimationPhase;
  isTopmost: boolean;
  totalDepth: number;
  onAnimationEnd: () => void;
  children: React.ReactNode;
};

const getPhaseClassName = (phase: PanelAnimationPhase): string => {
  switch (phase) {
    case "entering":
      return styles.panelEntering;
    case "exiting":
      return styles.panelExiting;
    default:
      return "";
  }
};

const AnimatedStackPanel: React.FC<AnimatedStackPanelProps> = ({
  id,
  depth,
  phase,
  isTopmost,
  totalDepth,
  onAnimationEnd,
  children,
}) => {
  /*
   * iOS Navigation behavior:
   * - Topmost panel: translateX(0), scale(1), opacity(1)
   * - Underlying panels: shift left, scale down, fade slightly
   * - Shadow is cast BY the top panel ONTO the underlying panel (overlay effect)
   */
  const levelsBack = isTopmost ? 0 : totalDepth - depth - 1;

  const getTransform = (): string => {
    if (phase === "exiting") {
      return ""; // CSS animation handles exit
    }
    if (phase === "entering") {
      return ""; // CSS animation handles enter
    }
    if (isTopmost) {
      return "translateX(0) scale(1)";
    }
    // Underlying panels: shift left + scale down
    const parallaxOffset = levelsBack * -33;
    const scale = 1 - levelsBack * 0.05; // 5% smaller per level
    return `translateX(${parallaxOffset}%) scale(${scale})`;
  };

  /*
   * Shadow dynamics:
   * - Shadow is cast by this panel onto the space to the left
   * - Distance affects: width (wider when far), opacity (lighter when far)
   * - Gradient: darkest at panel edge (right), fades to left
   */
  const getShadowStyle = (): React.CSSProperties | null => {
    if (depth === 0) return null;

    const distance = levelsBack;

    // Shadow gets wider and softer as distance increases
    const baseWidth = 30;
    const width = baseWidth + distance * 15;
    const opacity = Math.max(0.12 - distance * 0.03, 0.04);

    return {
      position: 'absolute' as const,
      top: 0,
      left: -width,
      width: width,
      height: '100%',
      pointerEvents: 'none' as const,
      // Gradient from right (panel edge, darkest) to left (fades out)
      background: `linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,${opacity * 0.5}) 60%, rgba(0,0,0,${opacity}) 100%)`,
    };
  };

  const style: React.CSSProperties = {
    zIndex: depth,
    transform: getTransform(),
    pointerEvents: isTopmost && phase !== "exiting" ? "auto" : "none",
  };

  const className = `${styles.stackPanel} ${getPhaseClassName(phase)}`;
  const shadowStyle = getShadowStyle();

  return (
    <div
      className={className}
      data-stack-panel={id}
      data-depth={depth}
      data-phase={phase}
      style={style}
      onAnimationEnd={onAnimationEnd}
    >
      {/* Shadow cast by THIS panel onto the space below */}
      {shadowStyle && <div style={shadowStyle} />}
      {children}
    </div>
  );
};

type StackTabletProps = {
  theme?: StackTheme;
};

export const StackTablet: React.FC<StackTabletProps> = ({ theme = "ios" }) => {
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = React.useState<StackTheme>(theme);

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

  // Use centralized animation state management
  const {
    panels: animatedPanels,
    markEnterComplete,
    markExitComplete,
  } = useStackAnimationState({
    stack: stack as ReadonlyArray<string>,
  });

  const handleMenuClick = (id: string) => {
    navigation.push(id as (typeof panels)[number]["id"]);
  };

  const handleBack = () => {
    navigation.go(-1);
  };

  const currentPanelId = navigation.currentPanelId;
  const currentDetail = detailContent[currentPanelId] ?? detailContent.root;

  // Find the topmost active panel (not exiting)
  const activePanels = animatedPanels.filter((p) => p.phase !== "exiting");
  const topmostDepth = Math.max(...activePanels.map((p) => p.depth), 0);

  const containerClassName = `${styles.container} ${THEME_CLASSES[selectedTheme]}`;

  return (
    <div className={containerClassName}>
      {/* Sidebar with stacking menus */}
      <aside className={styles.sidebar}>
        <div ref={sidebarRef} className={styles.sidebarContent}>
          {animatedPanels.map((panel) => {
            const menu = menus[panel.id];
            if (menu == null) {
              return null;
            }

            const isTopmost = panel.depth === topmostDepth && panel.phase !== "exiting";
            const handleAnimEnd = () => {
              if (panel.phase === "entering") {
                markEnterComplete(panel.id);
              } else if (panel.phase === "exiting") {
                markExitComplete(panel.id);
              }
            };

            return (
              <AnimatedStackPanel
                key={panel.id}
                id={panel.id}
                depth={panel.depth}
                phase={panel.phase}
                isTopmost={isTopmost}
                totalDepth={topmostDepth + 1}
                onAnimationEnd={handleAnimEnd}
              >
                <MenuPanel
                  id={panel.id}
                  title={menu.title}
                  parentTitle={menu.parentTitle}
                  items={menu.items}
                  onItemClick={handleMenuClick}
                  onBack={handleBack}
                  canGoBack={panel.depth > 0}
                  currentPanelId={currentPanelId}
                />
              </AnimatedStackPanel>
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
