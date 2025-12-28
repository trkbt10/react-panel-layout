/**
 * @file Drawer component
 *
 * Mobile-friendly slide-in panel with backdrop support.
 * Supports swipe gestures for opening/closing.
 */
import * as React from "react";
import type { DrawerBehavior, WindowPosition } from "../../types.js";
import {
  FloatingPanelCloseButton,
  FloatingPanelContent,
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
} from "../paneling/FloatingPanelFrame.js";
import {
  DRAWER_HEADER_PADDING_Y,
  DRAWER_HEADER_PADDING_X,
  DRAWER_HEADER_GAP,
  DRAWER_CONTENT_PADDING,
} from "../../constants/styles.js";
import { useDrawerSwipeInput } from "../../modules/drawer/useDrawerSwipeInput.js";
import type { DrawerSwipeDirection } from "../../modules/drawer/types.js";
import {
  DRAWER_BACKDROP_BASE_STYLE,
  DRAWER_PANEL_BASE_STYLE,
  getPlacementStyle,
  getOpenTransform,
  computeTransitionValue,
  computeBackdropTransition,
  formatDimension,
  computeEdgeZoneStyle,
} from "./drawerStyles.js";
import type { DrawerPlacement } from "./drawerStyles.js";
import {
  parseSwipeGesturesConfig,
  resolvePlacement,
  shouldShowEdgeZone,
} from "./drawerSwipeConfig.js";
import { useDrawerSwipeTransform } from "./useDrawerSwipeTransform.js";

// ============================================================================
// Types
// ============================================================================

export type DrawerProps = {
  id: string;
  config: DrawerBehavior;
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  children: React.ReactNode;
  zIndex?: number;
  width?: string | number;
  height?: string | number;
  position?: WindowPosition;
};

// ============================================================================
// Sub-components
// ============================================================================

type DrawerContentProps = {
  chrome: boolean;
  frameStyle: React.CSSProperties;
  header?: DrawerBehavior["header"];
  dismissible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const DrawerContent: React.FC<DrawerContentProps> = ({
  chrome,
  frameStyle,
  header,
  dismissible,
  onClose,
  children,
}) => {
  if (!chrome) {
    return <>{children}</>;
  }
  return (
    <FloatingPanelFrame style={frameStyle}>
      <DrawerHeaderView header={header} dismissible={dismissible} onClose={onClose} />
      <FloatingPanelContent
        style={{ padding: DRAWER_CONTENT_PADDING, flex: 1, display: "flex", flexDirection: "column" }}
      >
        {children}
      </FloatingPanelContent>
    </FloatingPanelFrame>
  );
};

type DrawerHeaderViewProps = {
  header?: DrawerBehavior["header"];
  dismissible: boolean;
  onClose: () => void;
};

function shouldShowCloseButton(dismissible: boolean, showCloseButton: boolean): boolean {
  if (!dismissible) {
    return false;
  }
  return showCloseButton;
}

function renderCloseButton(
  shouldShow: boolean,
  onClose: () => void,
): React.ReactNode {
  if (!shouldShow) {
    return null;
  }
  return (
    <FloatingPanelCloseButton
      onClick={onClose}
      aria-label="Close drawer"
      style={{ marginLeft: "auto" }}
    />
  );
}

function renderEdgeZone(
  showEdgeZone: boolean,
  edgeZoneRef: React.RefObject<HTMLDivElement | null>,
  edgeZoneStyle: React.CSSProperties,
  onPointerDown: ((e: React.PointerEvent<HTMLElement>) => void) | undefined,
  placement: string,
): React.ReactNode {
  if (!showEdgeZone) {
    return null;
  }
  return (
    <div
      ref={edgeZoneRef}
      style={edgeZoneStyle}
      onPointerDown={onPointerDown}
      data-drawer-edge-zone={placement}
    />
  );
}

const DrawerHeaderView: React.FC<DrawerHeaderViewProps> = ({ header, dismissible, onClose }) => {
  if (!header) {
    return null;
  }

  const showCloseButton = header.showCloseButton ?? true;
  const shouldShow = shouldShowCloseButton(dismissible, showCloseButton);

  return (
    <FloatingPanelHeader
      style={{ padding: `${DRAWER_HEADER_PADDING_Y} ${DRAWER_HEADER_PADDING_X}`, gap: DRAWER_HEADER_GAP }}
    >
      <FloatingPanelTitle>{header.title}</FloatingPanelTitle>
      {renderCloseButton(shouldShow, onClose)}
    </FloatingPanelHeader>
  );
};

// ============================================================================
// Style computation hooks
// ============================================================================

function useDrawerPanelStyle(
  placement: DrawerPlacement,
  isOpen: boolean,
  isSwipeOperating: boolean,
  config: DrawerBehavior,
  dimensions: { width?: string | number; height?: string | number; zIndex?: number },
): React.CSSProperties {
  return React.useMemo((): React.CSSProperties => {
    const effectiveMode = isSwipeOperating ? "none" : config.transitionMode;
    const transitionValue = computeTransitionValue(
      effectiveMode,
      config.transitionDuration,
      config.transitionEasing,
    );

    const placementStyle = getPlacementStyle(placement);
    const transform = isOpen ? getOpenTransform(placement) : placementStyle.transform;
    const position = config.inline ? "absolute" : "fixed";

    return {
      ...DRAWER_PANEL_BASE_STYLE,
      position,
      ...placementStyle,
      transform,
      transition: transitionValue,
      zIndex: dimensions.zIndex,
      width: formatDimension(dimensions.width),
      height: formatDimension(dimensions.height),
    };
  }, [placement, isOpen, isSwipeOperating, config, dimensions]);
}

function useBackdropStyle(
  placement: DrawerPlacement,
  isOpen: boolean,
  isSwipeOperating: boolean,
  config: DrawerBehavior,
  zIndex: number | undefined,
): React.CSSProperties {
  return React.useMemo((): React.CSSProperties => {
    const effectiveMode = isSwipeOperating ? "none" : config.transitionMode;
    const transitionValue = computeBackdropTransition(effectiveMode, config.transitionDuration);
    const position = config.inline ? "absolute" as const : "fixed" as const;

    return {
      ...DRAWER_BACKDROP_BASE_STYLE,
      position,
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? "auto" : "none",
      transition: transitionValue,
      zIndex: zIndex !== undefined ? zIndex - 1 : undefined,
    };
  }, [isOpen, isSwipeOperating, config, zIndex]);
}

function useFrameStyle(placement: DrawerPlacement): React.CSSProperties {
  return React.useMemo((): React.CSSProperties => {
    const style: React.CSSProperties = { borderRadius: 0 };
    if (placement === "left" || placement === "right") {
      style.height = "100%";
    }
    return style;
  }, [placement]);
}

// ============================================================================
// Main Component
// ============================================================================

export const Drawer: React.FC<DrawerProps> = ({
  id,
  config,
  isOpen,
  onClose,
  onOpen,
  children,
  zIndex,
  width,
  height,
  position,
}) => {
  const {
    dismissible = true,
    header,
    chrome = true,
    inline = false,
  } = config;

  const swipeConfig = parseSwipeGesturesConfig(config.swipeGestures);
  const placement = resolvePlacement(config.anchor, position);

  // Refs
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const edgeZoneRef = React.useRef<HTMLDivElement>(null);

  // Swipe callbacks
  const handleSwipeOpen = React.useCallback(() => {
    onOpen?.();
    config.onStateChange?.(true);
  }, [onOpen, config]);

  const handleSwipeClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  // Swipe input handling
  const {
    state: swipeState,
    displacement,
    edgeContainerProps,
    drawerContentProps,
    isOpening,
    isClosing,
  } = useDrawerSwipeInput({
    edgeContainerRef: edgeZoneRef,
    drawerContentRef: drawerRef,
    direction: placement as DrawerSwipeDirection,
    isOpen,
    onSwipeOpen: handleSwipeOpen,
    onSwipeClose: handleSwipeClose,
    enableEdgeSwipeOpen: swipeConfig.edgeSwipeOpen,
    enableSwipeClose: swipeConfig.swipeClose,
    edgeWidth: swipeConfig.edgeWidth,
    dismissThreshold: swipeConfig.dismissThreshold,
  });

  const isSwipeOperating = swipeState.phase === "operating";

  // Apply swipe transform
  useDrawerSwipeTransform({
    drawerRef,
    backdropRef,
    placement: placement as DrawerSwipeDirection,
    swipeState,
    displacement,
    isOpening,
    isClosing,
    enabled: swipeConfig.enabled,
  });

  // Computed styles
  const drawerStyle = useDrawerPanelStyle(placement, isOpen, isSwipeOperating, config, { width, height, zIndex });
  const backdropStyle = useBackdropStyle(placement, isOpen, isSwipeOperating, config, zIndex);
  const frameStyle = useFrameStyle(placement);

  // Edge zone style: merge positioning style with gesture handlers' style
  const edgeZoneStyle = React.useMemo((): React.CSSProperties => {
    const positioningStyle = computeEdgeZoneStyle({
      placement,
      inline,
      edgeWidth: swipeConfig.edgeWidth,
      zIndex,
    });
    // Merge with gesture container styles (touchAction, etc.)
    return { ...positioningStyle, ...edgeContainerProps.style };
  }, [placement, inline, swipeConfig.edgeWidth, zIndex, edgeContainerProps.style]);

  // Merged drawer style with swipe props
  const mergedDrawerStyle = React.useMemo((): React.CSSProperties => {
    if (!swipeConfig.enabled) {
      return drawerStyle;
    }
    return { ...drawerStyle, ...drawerContentProps.style };
  }, [swipeConfig.enabled, drawerStyle, drawerContentProps.style]);

  // Visibility flags
  const showEdgeZone = shouldShowEdgeZone(swipeConfig, isOpen, isOpening);
  const ariaLabel = header?.title ?? config.ariaLabel ?? "Drawer";

  const edgeZoneElement = renderEdgeZone(showEdgeZone, edgeZoneRef, edgeZoneStyle, edgeContainerProps.onPointerDown, placement);

  return (
    <>
      {edgeZoneElement}
      <div
        ref={backdropRef}
        style={backdropStyle}
        onClick={dismissible ? onClose : undefined}
      />
      <div
        ref={drawerRef}
        data-layer-id={id}
        data-placement={placement}
        style={mergedDrawerStyle}
        role="dialog"
        aria-modal={dismissible ? true : undefined}
        aria-hidden={isOpen ? undefined : true}
        aria-label={ariaLabel}
        onPointerDown={swipeConfig.enabled ? drawerContentProps.onPointerDown : undefined}
      >
        <DrawerContent
          chrome={chrome}
          frameStyle={frameStyle}
          header={header}
          dismissible={dismissible}
          onClose={onClose}
        >
          {children}
        </DrawerContent>
      </div>
    </>
  );
};
