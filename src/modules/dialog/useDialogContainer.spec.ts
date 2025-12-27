/**
 * @file Tests for useDialogContainer hook
 */
import * as React from "react";
import { renderHook, act } from "@testing-library/react";
import { useDialogContainer } from "./useDialogContainer";

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

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.SyntheticEvent;

    act(() => {
      result.current.dialogProps.onCancel(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
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

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.SyntheticEvent;

    act(() => {
      result.current.dialogProps.onCancel(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
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
    const mockEvent = {
      target: mockDialog,
      currentTarget: mockDialog,
    } as unknown as React.MouseEvent<HTMLDialogElement>;

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

    const mockEvent = {
      target: mockDialog,
      currentTarget: mockDialog,
    } as unknown as React.MouseEvent<HTMLDialogElement>;

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
    const mockEvent = {
      target: contentElement,
      currentTarget: mockDialog,
    } as unknown as React.MouseEvent<HTMLDialogElement>;

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
