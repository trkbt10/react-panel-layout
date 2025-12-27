/**
 * @file Tests for useDialogContainer hook
 */
import * as React from "react";
import { renderHook, act } from "@testing-library/react";
import { useDialogContainer } from "./useDialogContainer";

/**
 * Mock SyntheticEvent with call tracking.
 */
type MockSyntheticEvent = React.SyntheticEvent & {
  preventDefault: (() => void) & { calls: number };
};

/**
 * Creates a mock React.SyntheticEvent with preventDefault tracking.
 */
function createMockSyntheticEvent(): MockSyntheticEvent {
  const noop = (): void => {};
  const noopBool = (): boolean => false;
  const element = document.createElement("div");

  const preventDefaultFn = (): void => {
    preventDefaultFn.calls += 1;
  };
  preventDefaultFn.calls = 0;

  return {
    preventDefault: preventDefaultFn,
    target: element,
    currentTarget: element,
    nativeEvent: new Event("test"),
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    isDefaultPrevented: noopBool,
    stopPropagation: noop,
    isPropagationStopped: noopBool,
    persist: noop,
    timeStamp: Date.now(),
    type: "test",
  };
}

/**
 * Creates a mock React.MouseEvent for dialog interactions.
 */
function createMockMouseEvent(
  target: EventTarget,
  currentTarget: EventTarget,
): React.MouseEvent<HTMLDialogElement> {
  const noop = (): void => {};
  const noopBool = (): boolean => false;
  const nativeEvent = new MouseEvent("click");

  return {
    target,
    currentTarget,
    nativeEvent,
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    preventDefault: noop,
    isDefaultPrevented: noopBool,
    stopPropagation: noop,
    isPropagationStopped: noopBool,
    persist: noop,
    timeStamp: Date.now(),
    type: "click",
    // MouseEvent properties
    altKey: false,
    button: 0,
    buttons: 1,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    getModifierState: noopBool,
    movementX: 0,
    movementY: 0,
    pageX: 0,
    pageY: 0,
    relatedTarget: null,
    screenX: 0,
    screenY: 0,
    // UIEvent properties
    detail: 0,
    view: window,
  };
}

describe("useDialogContainer", () => {
  let mockDialog: HTMLDialogElement;

  beforeEach(() => {
    // Create mock dialog element
    mockDialog = document.createElement("dialog");
    mockDialog.showModal = vi.fn();
    mockDialog.close = vi.fn();
    Object.defineProperty(mockDialog, "open", {
      value: false,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  it("should return dialogRef and dialogProps", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useDialogContainer({
        visible: false,
        onClose,
      }),
    );

    expect(result.current.dialogRef).toBeDefined();
    expect(result.current.dialogProps).toBeDefined();
    expect(result.current.dialogProps.onCancel).toBeInstanceOf(Function);
    expect(result.current.dialogProps.onClick).toBeInstanceOf(Function);
  });

  it("should call showModal when visible becomes true", () => {
    const onClose = vi.fn();
    const { result, rerender } = renderHook(
      ({ visible }) =>
        useDialogContainer({
          visible,
          onClose,
        }),
      { initialProps: { visible: false } },
    );

    // Assign mock dialog to ref
    act(() => {
      (result.current.dialogRef as React.MutableRefObject<HTMLDialogElement | null>).current = mockDialog;
    });

    // Make visible
    rerender({ visible: true });

    expect(mockDialog.showModal).toHaveBeenCalled();
  });

  it("should call close when visible becomes false", () => {
    const onClose = vi.fn();
    const { result, rerender } = renderHook(
      ({ visible }) =>
        useDialogContainer({
          visible,
          onClose,
        }),
      { initialProps: { visible: true } },
    );

    // Assign mock dialog to ref and set as open
    act(() => {
      (result.current.dialogRef as React.MutableRefObject<HTMLDialogElement | null>).current = mockDialog;
      Object.defineProperty(mockDialog, "open", { value: true, configurable: true });
    });

    // Make invisible
    rerender({ visible: false });

    expect(mockDialog.close).toHaveBeenCalled();
  });

  it("should prevent default on cancel event and call onClose when closeOnEscape is true", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose,
        closeOnEscape: true,
      }),
    );

    const mockEvent = createMockSyntheticEvent();

    act(() => {
      result.current.dialogProps.onCancel(mockEvent);
    });

    expect(mockEvent.preventDefault.calls).toBeGreaterThan(0);
    expect(onClose).toHaveBeenCalled();
  });

  it("should prevent default on cancel event but NOT call onClose when closeOnEscape is false", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose,
        closeOnEscape: false,
      }),
    );

    const mockEvent = createMockSyntheticEvent();

    act(() => {
      result.current.dialogProps.onCancel(mockEvent);
    });

    expect(mockEvent.preventDefault.calls).toBeGreaterThan(0);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should call onClose on backdrop click when dismissible is true", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose,
        dismissible: true,
      }),
    );

    // Simulate click on dialog element itself (backdrop area)
    const mockEvent = createMockMouseEvent(mockDialog, mockDialog);

    act(() => {
      result.current.dialogProps.onClick(mockEvent);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("should NOT call onClose on backdrop click when dismissible is false", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose,
        dismissible: false,
      }),
    );

    const mockEvent = createMockMouseEvent(mockDialog, mockDialog);

    act(() => {
      result.current.dialogProps.onClick(mockEvent);
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should NOT call onClose when click is on content (not backdrop)", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose,
        dismissible: true,
      }),
    );

    const contentElement = document.createElement("div");

    // Click on content inside dialog
    const mockEvent = createMockMouseEvent(contentElement, mockDialog);

    act(() => {
      result.current.dialogProps.onClick(mockEvent);
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should set body overflow to hidden when visible and preventBodyScroll is true", () => {
    const onClose = vi.fn();
    const { unmount } = renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose,
        preventBodyScroll: true,
      }),
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    // Should restore
    expect(document.body.style.overflow).toBe("");
  });

  it("should NOT set body overflow when preventBodyScroll is false", () => {
    const onClose = vi.fn();
    renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose,
        preventBodyScroll: false,
      }),
    );

    expect(document.body.style.overflow).toBe("");
  });
});
