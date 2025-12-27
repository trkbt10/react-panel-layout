/**
 * @file Tests for useDialogContainer hook
 */
import * as React from "react";
import { renderHook, act } from "@testing-library/react";
import { useDialogContainer } from "./useDialogContainer";

type CallTracker = {
  calls: ReadonlyArray<ReadonlyArray<unknown>>;
  fn: (...args: ReadonlyArray<unknown>) => void;
};

const createCallTracker = (): CallTracker => {
  const calls: Array<ReadonlyArray<unknown>> = [];
  const fn = (...args: ReadonlyArray<unknown>): void => {
    calls.push(args);
  };
  return { calls, fn };
};

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
  const dialogState = {
    dialog: document.createElement("dialog") as HTMLDialogElement,
    showModal: createCallTracker(),
    close: createCallTracker(),
  };

  beforeEach(() => {
    // Create mock dialog element
    dialogState.dialog = document.createElement("dialog");
    dialogState.showModal = createCallTracker();
    dialogState.close = createCallTracker();
    dialogState.dialog.showModal = () => {
      dialogState.showModal.fn();
    };
    dialogState.dialog.close = () => {
      dialogState.close.fn();
    };
    Object.defineProperty(dialogState.dialog, "open", {
      value: false,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  it("should return dialogRef and dialogProps", () => {
    const onClose = createCallTracker();
    const { result } = renderHook(() =>
      useDialogContainer({
        visible: false,
        onClose: onClose.fn,
      }),
    );

    expect(result.current.dialogRef).toBeDefined();
    expect(result.current.dialogProps).toBeDefined();
    expect(result.current.dialogProps.onCancel).toBeInstanceOf(Function);
    expect(result.current.dialogProps.onClick).toBeInstanceOf(Function);
  });

  it("should call showModal when visible becomes true", () => {
    const onClose = createCallTracker();
    const { result, rerender } = renderHook(
      ({ visible }) =>
        useDialogContainer({
          visible,
          onClose: onClose.fn,
        }),
      { initialProps: { visible: false } },
    );

    // Assign mock dialog to ref
    act(() => {
      (result.current.dialogRef as React.MutableRefObject<HTMLDialogElement | null>).current = dialogState.dialog;
    });

    // Make visible
    rerender({ visible: true });

    expect(dialogState.showModal.calls).toHaveLength(1);
  });

  it("should call close when visible becomes false", () => {
    const onClose = createCallTracker();
    const { result, rerender } = renderHook(
      ({ visible }) =>
        useDialogContainer({
          visible,
          onClose: onClose.fn,
        }),
      { initialProps: { visible: true } },
    );

    // Assign mock dialog to ref and set as open
    act(() => {
      (result.current.dialogRef as React.MutableRefObject<HTMLDialogElement | null>).current = dialogState.dialog;
      Object.defineProperty(dialogState.dialog, "open", { value: true, configurable: true });
    });

    // Make invisible
    rerender({ visible: false });

    expect(dialogState.close.calls).toHaveLength(1);
  });

  it("should prevent default on cancel event and call onClose when closeOnEscape is true", () => {
    const onClose = createCallTracker();
    const { result } = renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose: onClose.fn,
        closeOnEscape: true,
      }),
    );

    const mockEvent = createMockSyntheticEvent();

    act(() => {
      result.current.dialogProps.onCancel(mockEvent);
    });

    expect(mockEvent.preventDefault.calls).toBeGreaterThan(0);
    expect(onClose.calls).toHaveLength(1);
  });

  it("should prevent default on cancel event but NOT call onClose when closeOnEscape is false", () => {
    const onClose = createCallTracker();
    const { result } = renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose: onClose.fn,
        closeOnEscape: false,
      }),
    );

    const mockEvent = createMockSyntheticEvent();

    act(() => {
      result.current.dialogProps.onCancel(mockEvent);
    });

    expect(mockEvent.preventDefault.calls).toBeGreaterThan(0);
    expect(onClose.calls).toHaveLength(0);
  });

  it("should call onClose on backdrop click when dismissible is true", () => {
    const onClose = createCallTracker();
    const { result } = renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose: onClose.fn,
        dismissible: true,
      }),
    );

    // Simulate click on dialog element itself (backdrop area)
    const mockEvent = createMockMouseEvent(dialogState.dialog, dialogState.dialog);

    act(() => {
      result.current.dialogProps.onClick(mockEvent);
    });

    expect(onClose.calls).toHaveLength(1);
  });

  it("should NOT call onClose on backdrop click when dismissible is false", () => {
    const onClose = createCallTracker();
    const { result } = renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose: onClose.fn,
        dismissible: false,
      }),
    );

    const mockEvent = createMockMouseEvent(dialogState.dialog, dialogState.dialog);

    act(() => {
      result.current.dialogProps.onClick(mockEvent);
    });

    expect(onClose.calls).toHaveLength(0);
  });

  it("should NOT call onClose when click is on content (not backdrop)", () => {
    const onClose = createCallTracker();
    const { result } = renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose: onClose.fn,
        dismissible: true,
      }),
    );

    const contentElement = document.createElement("div");

    // Click on content inside dialog
    const mockEvent = createMockMouseEvent(contentElement, dialogState.dialog);

    act(() => {
      result.current.dialogProps.onClick(mockEvent);
    });

    expect(onClose.calls).toHaveLength(0);
  });

  it("should set body overflow to hidden when visible and preventBodyScroll is true", () => {
    const onClose = createCallTracker();
    const { unmount } = renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose: onClose.fn,
        preventBodyScroll: true,
      }),
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    // Should restore
    expect(document.body.style.overflow).toBe("");
  });

  it("should NOT set body overflow when preventBodyScroll is false", () => {
    const onClose = createCallTracker();
    renderHook(() =>
      useDialogContainer({
        visible: true,
        onClose: onClose.fn,
        preventBodyScroll: false,
      }),
    );

    expect(document.body.style.overflow).toBe("");
  });
});
