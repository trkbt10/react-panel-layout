/**
 * @file Tests for Modal component
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

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

describe("Modal", () => {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  const originalClose = HTMLDialogElement.prototype.close;

  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
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
      <Modal visible={true} onClose={() => {}}>
        <div data-testid="content">Modal content</div>
      </Modal>,
    );

    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toHaveTextContent("Modal content");
  });

  it("should render header with title when provided", () => {
    render(
      <Modal visible={true} onClose={() => {}} header={{ title: "Test Title" }}>
        <div>Content</div>
      </Modal>,
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("should render close button in header when showCloseButton is true", () => {
    render(
      <Modal visible={true} onClose={() => {}} header={{ title: "Title", showCloseButton: true }}>
        <div>Content</div>
      </Modal>,
    );

    expect(screen.getByRole("button", { name: "Close modal" })).toBeInTheDocument();
  });

  it("should NOT render close button when showCloseButton is false", () => {
    render(
      <Modal visible={true} onClose={() => {}} header={{ title: "Title", showCloseButton: false }}>
        <div>Content</div>
      </Modal>,
    );

    expect(screen.queryByRole("button", { name: "Close modal" })).not.toBeInTheDocument();
  });

  it("should NOT render close button when dismissible is false", () => {
    render(
      <Modal visible={true} onClose={() => {}} dismissible={false} header={{ title: "Title", showCloseButton: true }}>
        <div>Content</div>
      </Modal>,
    );

    expect(screen.queryByRole("button", { name: "Close modal" })).not.toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    const onClose = createCallTracker();
    render(
      <Modal visible={true} onClose={onClose.fn} header={{ title: "Title" }}>
        <div>Content</div>
      </Modal>,
    );

    const closeButton = screen.getByRole("button", { name: "Close modal" });
    fireEvent.click(closeButton);

    expect(onClose.calls).toHaveLength(1);
  });

  it("should call onClose when Escape is pressed", () => {
    const onClose = createCallTracker();
    render(
      <Modal visible={true} onClose={onClose.fn}>
        <div>Content</div>
      </Modal>,
    );

    const dialog = document.querySelector("dialog");
    fireEvent(dialog!, new Event("cancel", { bubbles: true, cancelable: true }));

    expect(onClose.calls).toHaveLength(1);
  });

  it("should call onClose when backdrop is clicked", () => {
    const onClose = createCallTracker();
    render(
      <Modal visible={true} onClose={onClose.fn}>
        <div data-testid="content">Content</div>
      </Modal>,
    );

    const dialog = document.querySelector("dialog");
    fireEvent.click(dialog!);

    expect(onClose.calls).toHaveLength(1);
  });

  it("should NOT call onClose when content is clicked", () => {
    const onClose = createCallTracker();
    render(
      <Modal visible={true} onClose={onClose.fn}>
        <div data-testid="content">Content</div>
      </Modal>,
    );

    const content = screen.getByTestId("content");
    fireEvent.click(content);

    expect(onClose.calls).toHaveLength(0);
  });

  it("should NOT render chrome when chrome is false", () => {
    render(
      <Modal visible={true} onClose={() => {}} chrome={false} header={{ title: "Title" }}>
        <div data-testid="content">Content</div>
      </Modal>,
    );

    // Header should not be rendered when chrome is false
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("should set aria-label from header title", () => {
    render(
      <Modal visible={true} onClose={() => {}} header={{ title: "Settings Dialog" }}>
        <div>Content</div>
      </Modal>,
    );

    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Settings Dialog");
  });

  it("should use custom aria-label when provided", () => {
    render(
      <Modal visible={true} onClose={() => {}} ariaLabel="Custom Label" header={{ title: "Title" }}>
        <div>Content</div>
      </Modal>,
    );

    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Custom Label");
  });

  it("should handle input focus without conflict", () => {
    render(
      <Modal visible={true} onClose={() => {}}>
        <input data-testid="input" type="text" />
      </Modal>,
    );

    const input = screen.getByTestId("input") as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: "test" } });

    expect(input.value).toBe("test");
  });

  it("should render with custom width and height", () => {
    render(
      <Modal visible={true} onClose={() => {}} width={500} height={400}>
        <div data-testid="content">Content</div>
      </Modal>,
    );

    const content = screen.getByTestId("content");
    // Traverse: FloatingPanelContent > inner > overflow > shadow > computedStyle div
    const styledDiv = content.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
    expect(styledDiv).toHaveStyle({ width: "500px", height: "400px" });
  });

  it("should render with string width and height", () => {
    render(
      <Modal visible={true} onClose={() => {}} width="80%" height="auto">
        <div data-testid="content">Content</div>
      </Modal>,
    );

    const content = screen.getByTestId("content");
    // Traverse: FloatingPanelContent > inner > overflow > shadow > computedStyle div
    const styledDiv = content.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
    expect(styledDiv).toHaveStyle({ width: "80%", height: "auto" });
  });
});
