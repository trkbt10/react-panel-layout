/**
 * @file Tests for DialogContainer component
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { DialogContainer } from "./DialogContainer";
import * as React from "react";

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

describe("DialogContainer", () => {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  const originalClose = HTMLDialogElement.prototype.close;
  const dialogCallState = {
    showModal: createCallTracker(),
    close: createCallTracker(),
  };

  beforeEach(() => {
    // Mock showModal and close for dialog element
    dialogCallState.showModal = createCallTracker();
    dialogCallState.close = createCallTracker();
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      dialogCallState.showModal.fn();
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      dialogCallState.close.fn();
      this.removeAttribute("open");
    };
  });

  afterEach(() => {
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  it("should render children when visible", () => {
    render(
      <DialogContainer visible={true} onClose={() => {}}>
        <div data-testid="content">Hello</div>
      </DialogContainer>,
    );

    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toHaveTextContent("Hello");
  });

  it("should call showModal when visible is true", () => {
    render(
      <DialogContainer visible={true} onClose={() => {}}>
        <div>Content</div>
      </DialogContainer>,
    );

    expect(dialogCallState.showModal.calls).toHaveLength(1);
  });

  it("should call close when visible changes from true to false", () => {
    const { rerender } = render(
      <DialogContainer visible={true} onClose={() => {}}>
        <div>Content</div>
      </DialogContainer>,
    );

    rerender(
      <DialogContainer visible={false} onClose={() => {}}>
        <div>Content</div>
      </DialogContainer>,
    );

    expect(dialogCallState.close.calls).toHaveLength(1);
  });

  it("should call onClose when Escape is pressed", () => {
    const onClose = createCallTracker();
    render(
      <DialogContainer visible={true} onClose={onClose.fn}>
        <div>Content</div>
      </DialogContainer>,
    );

    const dialog = document.querySelector("dialog");
    expect(dialog).not.toBeNull();

    // Simulate cancel event (triggered by Escape key)
    fireEvent(dialog!, new Event("cancel", { bubbles: true, cancelable: true }));

    expect(onClose.calls).toHaveLength(1);
  });

  it("should NOT call onClose when Escape is pressed and closeOnEscape is false", () => {
    const onClose = createCallTracker();
    render(
      <DialogContainer visible={true} onClose={onClose.fn} closeOnEscape={false}>
        <div>Content</div>
      </DialogContainer>,
    );

    const dialog = document.querySelector("dialog");
    fireEvent(dialog!, new Event("cancel", { bubbles: true, cancelable: true }));

    expect(onClose.calls).toHaveLength(0);
  });

  it("should call onClose when backdrop is clicked", () => {
    const onClose = createCallTracker();
    render(
      <DialogContainer visible={true} onClose={onClose.fn}>
        <div data-testid="content">Content</div>
      </DialogContainer>,
    );

    const dialog = document.querySelector("dialog");
    // Click directly on dialog (backdrop area)
    fireEvent.click(dialog!);

    expect(onClose.calls).toHaveLength(1);
  });

  it("should NOT call onClose when content is clicked", () => {
    const onClose = createCallTracker();
    render(
      <DialogContainer visible={true} onClose={onClose.fn}>
        <div data-testid="content">Content</div>
      </DialogContainer>,
    );

    const content = screen.getByTestId("content");
    fireEvent.click(content);

    expect(onClose.calls).toHaveLength(0);
  });

  it("should NOT call onClose when backdrop is clicked and dismissible is false", () => {
    const onClose = createCallTracker();
    render(
      <DialogContainer visible={true} onClose={onClose.fn} dismissible={false}>
        <div>Content</div>
      </DialogContainer>,
    );

    const dialog = document.querySelector("dialog");
    fireEvent.click(dialog!);

    expect(onClose.calls).toHaveLength(0);
  });

  it("should apply aria attributes", () => {
    render(
      <DialogContainer
        visible={true}
        onClose={() => {}}
        ariaLabel="Test dialog"
        ariaLabelledBy="title-id"
        ariaDescribedBy="desc-id"
      >
        <div>Content</div>
      </DialogContainer>,
    );

    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Test dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "title-id");
    expect(dialog).toHaveAttribute("aria-describedby", "desc-id");
  });

  it("should prevent body scroll when visible", () => {
    render(
      <DialogContainer visible={true} onClose={() => {}}>
        <div>Content</div>
      </DialogContainer>,
    );

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should restore body scroll on unmount", () => {
    const { unmount } = render(
      <DialogContainer visible={true} onClose={() => {}}>
        <div>Content</div>
      </DialogContainer>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });

  it("should NOT prevent body scroll when preventBodyScroll is false", () => {
    render(
      <DialogContainer visible={true} onClose={() => {}} preventBodyScroll={false}>
        <div>Content</div>
      </DialogContainer>,
    );

    expect(document.body.style.overflow).toBe("");
  });

  it("should stop propagation on content pointer down to prevent backdrop detection", () => {
    const onClose = createCallTracker();
    render(
      <DialogContainer visible={true} onClose={onClose.fn}>
        <button data-testid="button">Click me</button>
      </DialogContainer>,
    );

    const button = screen.getByTestId("button");
    fireEvent.pointerDown(button);

    // The click should not close the dialog because propagation is stopped
    expect(onClose.calls).toHaveLength(0);
  });
});
