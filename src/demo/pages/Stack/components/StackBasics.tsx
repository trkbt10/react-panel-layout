/**
 * @file Stack Navigation demo - iOS-style hierarchical navigation
 * Uses SwipeStackContent for direct DOM manipulation during swipe gestures.
 */
import * as React from "react";
import { useStackNavigation } from "../../../../modules/stack/useStackNavigation.js";
import { useStackSwipeInput } from "../../../../modules/stack/useStackSwipeInput.js";
import { SwipeStackContent } from "../../../../modules/stack/SwipeStackContent.js";
import { useResizeObserver } from "../../../../hooks/useResizeObserver.js";
import { toContinuousOperationState } from "../../../../hooks/gesture/types.js";
import type { StackPanel } from "../../../../modules/stack/types.js";
import styles from "./Stack.module.css";

const ANIMATION_DURATION = 300;

const panels: StackPanel[] = [
  {
    id: "list",
    title: "Items",
    content: null, // Will be replaced with dynamic content
  },
  {
    id: "detail",
    title: "Item Detail",
    content: null,
  },
  {
    id: "edit",
    title: "Edit Item",
    content: null,
  },
];

// Sample data
const listItems = [
  { id: 1, name: "Document 1", description: "A sample document" },
  { id: 2, name: "Document 2", description: "Another document" },
  { id: 3, name: "Document 3", description: "Yet another document" },
];

type BackButtonProps = {
  onClick: () => void;
  disabled: boolean;
};

const BackButton: React.FC<BackButtonProps> = ({ onClick, disabled }) => (
  <button className={styles.backButton} onClick={onClick} disabled={disabled}>
    ← Back
  </button>
);

type EditButtonProps = {
  onClick: () => void;
};

const EditButton: React.FC<EditButtonProps> = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick}>
    Edit
  </button>
);

export const StackBasics: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = React.useState<typeof listItems[0] | null>(null);

  const navigation = useStackNavigation({
    panels,
    displayMode: "overlay",
    transitionMode: "none", // Using direct DOM manipulation
  });

  const { isEdgeSwiping, progress, inputState, containerProps } = useStackSwipeInput({
    containerRef,
    navigation,
    edge: "left",
    edgeWidth: 30,
  });

  // Track container size for SwipeStackContent
  const { rect } = useResizeObserver(containerRef, { box: "border-box" });
  const containerSize = rect?.width ?? 0;

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
        }, ANIMATION_DURATION);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [depth, stack]);

  // Get visible panel IDs: active + behind (for swipe reveal) + exiting (for back animation)
  const visiblePanelIds = React.useMemo(() => {
    const ids: string[] = [];
    // Behind panel (if exists)
    if (depth > 0) {
      ids.push(stack[depth - 1]);
    }
    // Active panel
    ids.push(stack[depth]);
    // Include exiting panel if not already in the list
    if (exitingPanelId != null && !ids.includes(exitingPanelId)) {
      ids.push(exitingPanelId);
    }
    return ids;
  }, [stack, depth, exitingPanelId]);

  const handleItemClick = (item: typeof listItems[0]) => {
    setSelectedItem(item);
    navigation.push("detail");
  };

  const handleEdit = () => {
    navigation.push("edit");
  };

  const backButtonProps = navigation.getBackButtonProps();

  const getHeaderTitle = (): string => {
    if (navigation.state.depth === 0) {
      return "Items";
    }
    if (navigation.state.depth === 1) {
      return selectedItem?.name ?? "";
    }
    if (navigation.state.depth === 2) {
      return "Edit";
    }
    return "";
  };

  const showBackButton = navigation.state.depth > 0;
  const showEditButton = navigation.state.depth === 1;

  const renderBackButton = (): React.ReactNode => {
    if (!showBackButton) {
      return null;
    }
    return <BackButton onClick={backButtonProps.onClick} disabled={backButtonProps.disabled} />;
  };

  const renderPanelContent = (panelId: string): React.ReactNode => {
    if (panelId === "list") {
      return (
        <div className={styles.panel}>
          <ul className={styles.list}>
            {listItems.map((item) => (
              <li key={item.id} className={styles.listItem}>
                <button
                  className={styles.listItemButton}
                  onClick={() => handleItemClick(item)}
                >
                  <span className={styles.listItemName}>{item.name}</span>
                  <span className={styles.listItemDesc}>{item.description}</span>
                  <span className={styles.chevron}>→</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (panelId === "detail") {
      return (
        <div className={styles.panel}>
          <div className={styles.detailContent}>
            <h2>{selectedItem?.name}</h2>
            <p>{selectedItem?.description}</p>
            <div className={styles.detailMeta}>
              <span>ID: {selectedItem?.id}</span>
            </div>
            <p className={styles.hint}>
              Swipe from the left edge to go back, or tap the Back button.
            </p>
          </div>
        </div>
      );
    }

    if (panelId === "edit") {
      return (
        <div className={styles.panel}>
          <div className={styles.editContent}>
            <h2>Edit {selectedItem?.name}</h2>
            <div className={styles.form}>
              <label className={styles.label}>
                Name
                <input
                  type="text"
                  className={styles.input}
                  defaultValue={selectedItem?.name}
                />
              </label>
              <label className={styles.label}>
                Description
                <textarea
                  className={styles.textarea}
                  defaultValue={selectedItem?.description}
                />
              </label>
            </div>
            <button
              className={styles.saveButton}
              onClick={() => navigation.go(-1)}
            >
              Save Changes
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        {renderBackButton()}
        <h1 className={styles.title}>{getHeaderTitle()}</h1>
        {showEditButton ? <EditButton onClick={handleEdit} /> : null}
      </header>

      {/* Stack content area */}
      <div
        ref={containerRef}
        className={styles.stackContainer}
        {...containerProps}
      >
        {visiblePanelIds.map((panelId) => {
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
              operationState={toContinuousOperationState(inputState)}
              containerSize={containerSize}
              animateOnMount={true}
              animationDuration={ANIMATION_DURATION}
              displayMode="overlay"
            >
              {renderPanelContent(panelId)}
            </SwipeStackContent>
          );
        })}
      </div>

      {/* Debug info */}
      <div className={styles.debugInfo}>
        <span>Depth: {navigation.state.depth}</span>
        <span>Current: {navigation.currentPanelId}</span>
        {isEdgeSwiping ? <span>Swiping: {Math.round(progress * 100)}%</span> : null}
      </div>
    </div>
  );
};
