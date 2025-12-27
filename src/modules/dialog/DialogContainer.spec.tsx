/**
 * @file Tests for DialogContainer component
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { DialogContainer } from "./DialogContainer";
import * as React from "react";

describe("DialogContainer", () => {
  beforeEach(() => {
    // Mock showModal and close for dialog element
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
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

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it("should call onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <DialogContainer visible={true} onClose={onClose}>
        <div>Content</div>
      </DialogContainer>,
    );

    const dialog = document.querySelector("dialog");
    expect(dialog).not.toBeNull();

    // Simulate cancel event (triggered by Escape key)
    fireEvent(dialog!, new Event("cancel", { bubbles: true, cancelable: true }));

    expect(onClose).toHaveBeenCalled();
  });

  it("should NOT call onClose when Escape is pressed and closeOnEscape is false", () => {
    const onClose = vi.fn();
    render(
      <DialogContainer visible={true} onClose={onClose} closeOnEscape={false}>
        <div>Content</div>
      </DialogContainer>,
    );

    const dialog = document.querySelector("dialog");
    fireEvent(dialog!, new Event("cancel", { bubbles: true, cancelable: true }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should call onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(
      <DialogContainer visible={true} onClose={onClose}>
        <div data-testid="content">Content</div>
      </DialogContainer>,
    );

    const dialog = document.querySelector("dialog");
    // Click directly on dialog (backdrop area)
    fireEvent.click(dialog!);

    expect(onClose).toHaveBeenCalled();
  });

  it("should NOT call onClose when content is clicked", () => {
    const onClose = vi.fn();
    render(
      <DialogContainer visible={true} onClose={onClose}>
        <div data-testid="content">Content</div>
      </DialogContainer>,
    );

    const content = screen.getByTestId("content");
    fireEvent.click(content);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should NOT call onClose when backdrop is clicked and dismissible is false", () => {
    const onClose = vi.fn();
    render(
      <DialogContainer visible={true} onClose={onClose} dismissible={false}>
        <div>Content</div>
      </DialogContainer>,
    );

    const dialog = document.querySelector("dialog");
    fireEvent.click(dialog!);

    expect(onClose).not.toHaveBeenCalled();
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
    const onClose = vi.fn();
    render(
      <DialogContainer visible={true} onClose={onClose}>
        <button data-testid="button">Click me</button>
      </DialogContainer>,
    );

    const button = screen.getByTestId("button");
    fireEvent.pointerDown(button);

    // The click should not close the dialog because propagation is stopped
    expect(onClose).not.toHaveBeenCalled();
  });
});
