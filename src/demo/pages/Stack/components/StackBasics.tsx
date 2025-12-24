/**
 * @file Stack Navigation demo - iOS-style hierarchical navigation
 */
import * as React from "react";
import { useStackNavigation } from "../../../../modules/stack/useStackNavigation.js";
import { useStackSwipeInput } from "../../../../modules/stack/useStackSwipeInput.js";
import { StackContent } from "../../../../modules/stack/StackContent.js";
import type { StackPanel } from "../../../../modules/stack/types.js";
import styles from "./Stack.module.css";

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
    transitionMode: "css",
  });

  const { isEdgeSwiping, progress, containerProps } = useStackSwipeInput({
    containerRef,
    navigation,
    edge: "left",
    edgeWidth: 30,
  });

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

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        {showBackButton && <BackButton onClick={backButtonProps.onClick} disabled={backButtonProps.disabled} />}
        <h1 className={styles.title}>{getHeaderTitle()}</h1>
        {showEditButton ? <EditButton onClick={handleEdit} /> : null}
      </header>

      {/* Stack content area */}
      <div
        ref={containerRef}
        className={styles.stackContainer}
        {...containerProps}
      >
        {/* List Panel */}
        <StackContent
          id="list"
          depth={0}
          isActive={navigation.currentPanelId === "list"}
          displayMode="overlay"
          transitionMode="css"
          navigationState={navigation.state}
          swipeProgress={navigation.currentPanelId === "list" ? progress : undefined}
        >
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
        </StackContent>

        {/* Detail Panel */}
        <StackContent
          id="detail"
          depth={1}
          isActive={navigation.currentPanelId === "detail"}
          displayMode="overlay"
          transitionMode="css"
          navigationState={navigation.state}
          swipeProgress={navigation.currentPanelId === "detail" ? progress : undefined}
        >
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
        </StackContent>

        {/* Edit Panel */}
        <StackContent
          id="edit"
          depth={2}
          isActive={navigation.currentPanelId === "edit"}
          displayMode="overlay"
          transitionMode="css"
          navigationState={navigation.state}
          swipeProgress={navigation.currentPanelId === "edit" ? progress : undefined}
        >
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
        </StackContent>
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
