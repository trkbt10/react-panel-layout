/**
 * @file SwipeDialogDemo - Demonstration of swipeable dialog functionality
 */
import * as React from "react";
import { Modal } from "../../../../modules/dialog/Modal.js";
import { DialogContainer } from "../../../../modules/dialog/DialogContainer.js";
import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelContent,
} from "../../../../components/paneling/FloatingPanelFrame.js";
import { DemoButton } from "../../../components/ui/DemoButton.js";
import styles from "./SwipeDialogDemo.module.css";

/**
 * Demo component for swipeable dialogs
 */
export const SwipeDialogDemo: React.FC = () => {
  const [bottomModal, setBottomModal] = React.useState(false);
  const [centerModal, setCenterModal] = React.useState(false);
  const [scrollableModal, setScrollableModal] = React.useState(false);
  const [customSheet, setCustomSheet] = React.useState(false);

  return (
    <div className={styles.container}>
      {/* Bottom Sheet Style */}
      <div className={styles.section}>
        <div className={styles.label}>Bottom Sheet (Swipe Down)</div>
        <div className={styles.buttonGroup}>
          <DemoButton onClick={() => setBottomModal(true)}>
            Open Bottom Sheet
          </DemoButton>
        </div>
      </div>

      {/* Center Modal with Swipe */}
      <div className={styles.section}>
        <div className={styles.label}>Center Modal (Swipe Down)</div>
        <div className={styles.buttonGroup}>
          <DemoButton variant="secondary" onClick={() => setCenterModal(true)}>
            Open Center Modal
          </DemoButton>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className={styles.section}>
        <div className={styles.label}>With Scrollable Content</div>
        <div className={styles.buttonGroup}>
          <DemoButton variant="secondary" onClick={() => setScrollableModal(true)}>
            Open Scrollable Modal
          </DemoButton>
        </div>
      </div>

      {/* Custom Action Sheet */}
      <div className={styles.section}>
        <div className={styles.label}>Custom Action Sheet</div>
        <div className={styles.buttonGroup}>
          <DemoButton onClick={() => setCustomSheet(true)}>
            Open Action Sheet
          </DemoButton>
        </div>
      </div>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={bottomModal}
        onClose={() => setBottomModal(false)}
        transitionMode="swipe"
        openDirection="bottom"
        swipeDismissible={true}
        header={{ title: "Bottom Sheet" }}
        width={400}
      >
        <div className={styles.modalContent}>
          <div className={styles.infoBox}>
            Swipe down to close this modal. The animation has two phases: translate movement followed by a scale-down
            effect.
          </div>
          <p>This modal opens from the bottom and can be dismissed by swiping down.</p>
          <DemoButton variant="secondary" onClick={() => setBottomModal(false)}>
            Close
          </DemoButton>
        </div>
      </Modal>

      {/* Center Modal */}
      <Modal
        visible={centerModal}
        onClose={() => setCenterModal(false)}
        transitionMode="swipe"
        openDirection="center"
        swipeDismissible={true}
        header={{ title: "Swipeable Modal" }}
        width={400}
      >
        <div className={styles.modalContent}>
          <div className={styles.infoBox}>
            Even centered modals can be dismissed by swiping down. The threshold is 30% of the container height or a
            quick flick.
          </div>
          <p>Try swiping this modal down to dismiss it.</p>
          <DemoButton variant="secondary" onClick={() => setCenterModal(false)}>
            Close
          </DemoButton>
        </div>
      </Modal>

      {/* Scrollable Content Modal */}
      <Modal
        visible={scrollableModal}
        onClose={() => setScrollableModal(false)}
        transitionMode="swipe"
        openDirection="bottom"
        swipeDismissible={true}
        header={{ title: "Scrollable Content" }}
        width={400}
        height={500}
      >
        <div className={styles.scrollableContent}>
          <div className={styles.infoBox} style={{ marginBottom: "16px" }}>
            Swipe gestures are detected only when NOT scrolling. Try scrolling the content below, then swipe down from
            the header area.
          </div>
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i} style={{ marginBottom: "12px" }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Item {i + 1}.
            </p>
          ))}
        </div>
      </Modal>

      {/* Custom Action Sheet */}
      <DialogContainer
        visible={customSheet}
        onClose={() => setCustomSheet(false)}
        transitionMode="swipe"
        openDirection="bottom"
        swipeDismissible={true}
      >
        <div className={styles.actionSheet}>
          <FloatingPanelFrame>
            <FloatingPanelHeader>
              <FloatingPanelTitle>Actions</FloatingPanelTitle>
            </FloatingPanelHeader>
            <FloatingPanelContent style={{ padding: 0 }}>
              <ActionItem icon="📷" label="Take Photo" onClick={() => setCustomSheet(false)} />
              <ActionItem icon="🖼️" label="Choose from Library" onClick={() => setCustomSheet(false)} />
              <ActionItem icon="📁" label="Browse Files" onClick={() => setCustomSheet(false)} />
              <ActionItem icon="❌" label="Cancel" onClick={() => setCustomSheet(false)} isDestructive />
            </FloatingPanelContent>
          </FloatingPanelFrame>
        </div>
      </DialogContainer>
    </div>
  );
};

type ActionItemProps = {
  icon: string;
  label: string;
  onClick: () => void;
  isDestructive?: boolean;
};

const ActionItem: React.FC<ActionItemProps> = ({ icon, label, onClick, isDestructive }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.actionItem}
      style={{ color: isDestructive ? "#ef4444" : undefined }}
    >
      <span className={styles.actionIcon}>{icon}</span>
      <span>{label}</span>
    </button>
  );
};
