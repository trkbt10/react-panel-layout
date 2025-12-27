/**
 * @file CardExpandDemo - Apple Music style card expansion using viewTransition
 */
import * as React from "react";
import { useSharedElementTransition } from "../../../../hooks/useSharedElementTransition.js";
import { DemoButton } from "../../../components/ui/DemoButton.js";
import styles from "./CardExpandDemo.module.css";

type Album = {
  id: string;
  title: string;
  artist: string;
  color: string;
};

const albums: Album[] = [
  { id: "1", title: "Midnight Dreams", artist: "Luna", color: "#1a1a2e" },
  { id: "2", title: "Ocean Waves", artist: "The Currents", color: "#16213e" },
  { id: "3", title: "Summer Nights", artist: "Sunset", color: "#e94560" },
  { id: "4", title: "City Lights", artist: "Neon", color: "#0f3460" },
  { id: "5", title: "Forest Walk", artist: "Nature", color: "#2d4a22" },
  { id: "6", title: "Golden Hour", artist: "Horizon", color: "#c9a227" },
];

type AlbumCardProps = {
  album: Album;
  sourceProps: { style: React.CSSProperties };
  onClick: () => void;
};

const AlbumCard: React.FC<AlbumCardProps> = ({ album, sourceProps, onClick }) => {
  return (
    <button
      type="button"
      className={styles.card}
      style={{ backgroundColor: album.color, ...sourceProps.style }}
      onClick={onClick}
    >
      <div className={styles.cardArt}>
        <svg viewBox="0 0 100 100" className={styles.cardIcon}>
          <circle cx="50" cy="50" r="30" fill="rgba(255,255,255,0.2)" />
          <circle cx="50" cy="50" r="10" fill="rgba(255,255,255,0.4)" />
        </svg>
      </div>
      <div className={styles.cardInfo}>
        <div className={styles.cardTitle}>{album.title}</div>
        <div className={styles.cardArtist}>{album.artist}</div>
      </div>
    </button>
  );
};

type ExpandedViewProps = {
  album: Album;
  targetProps: { style: React.CSSProperties };
  swipeContainerProps: React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties };
  onClose: () => void;
};

const ExpandedView: React.FC<ExpandedViewProps> = ({ album, targetProps, swipeContainerProps, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Extract event handlers from swipeContainerProps (exclude style to merge manually)
  const { style: swipeStyle, ...swipeEventHandlers } = swipeContainerProps;

  // Merge all styles properly
  const mergedStyle: React.CSSProperties = {
    backgroundColor: album.color,
    ...swipeStyle,
    ...targetProps.style,
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
        className={styles.expanded}
        style={mergedStyle}
        {...swipeEventHandlers}
      >
        <div className={styles.dragHandle} />

        <div className={styles.expandedArt}>
          <svg viewBox="0 0 100 100" className={styles.expandedIcon}>
            <circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.15)" />
            <circle cx="50" cy="50" r="15" fill="rgba(255,255,255,0.3)" />
          </svg>
        </div>

        <div className={styles.expandedInfo}>
          <h2 className={styles.expandedTitle}>{album.title}</h2>
          <p className={styles.expandedArtist}>{album.artist}</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: "35%" }} />
          </div>
          <div className={styles.timeLabels}>
            <span>1:24</span>
            <span>-2:36</span>
          </div>
        </div>

        <div className={styles.playbackControls}>
          <button type="button" className={styles.controlButton}>
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button type="button" className={styles.playButton}>
            <svg viewBox="0 0 24 24" width="40" height="40">
              <path fill="currentColor" d="M6 4h4v16H6zm8 0h4v16h-4z" />
            </svg>
          </button>
          <button type="button" className={styles.controlButton}>
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        <DemoButton variant="ghost" onClick={onClose} className={styles.closeButton}>
          Close
        </DemoButton>
      </div>
    </div>
  );
};

// Global CSS for view transitions (CSS Modules don't support global pseudo-elements)
const viewTransitionStyles = `
  /* Disable default root crossfade during view transition */
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }

  /* Album card/expanded morph animation */
  ::view-transition-group(*) {
    animation-duration: 0.35s;
    animation-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
    /* Ensure morph is above backdrop */
    z-index: 2000;
  }

  /* Show destination state immediately, hide source */
  ::view-transition-old(*) {
    animation: none;
    opacity: 0;
  }
  ::view-transition-new(*) {
    animation: none;
    opacity: 1;
  }
`;

/**
 * Demo component for Apple Music style card expansion using viewTransition
 */
export const CardExpandDemo: React.FC = () => {
  const { expandedItem, expand, collapse, getSourceProps, getTargetProps, getSwipeContainerProps, isSupported } =
    useSharedElementTransition<Album>({
      // Use single transition name for the whole card/expanded view
      getTransitionName: (album) => `album-${album.id}`,
      getKey: (album) => album.id,
    });

  return (
    <div className={styles.container}>
      <style>{viewTransitionStyles}</style>
      <div className={styles.header}>
        <h3 className={styles.sectionTitle}>Recently Played</h3>
        <p className={styles.hint}>
          Tap a card to expand
          {isSupported ? " (View Transitions API)" : " (fallback mode)"}
        </p>
      </div>

      <div className={styles.grid}>
        {albums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            sourceProps={getSourceProps(album)}
            onClick={() => expand(album)}
          />
        ))}
      </div>

      {expandedItem && (
        <ExpandedView
          album={expandedItem}
          targetProps={getTargetProps()}
          swipeContainerProps={getSwipeContainerProps()}
          onClose={collapse}
        />
      )}
    </div>
  );
};
