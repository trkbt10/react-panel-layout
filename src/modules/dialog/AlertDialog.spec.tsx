/**
 * @file Tests for AlertDialog component
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AlertDialog } from "./AlertDialog";

describe("AlertDialog", () => {
  beforeEach(() => {
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

  describe("alert type", () => {
    it("should render message", () => {
      render(
        <AlertDialog
          type="alert"
          visible={true}
          message="This is an alert message"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      expect(screen.getByText("This is an alert message")).toBeInTheDocument();
    });

    it("should render title when provided", () => {
      render(
        <AlertDialog
          type="alert"
          visible={true}
          title="Alert Title"
          message="Message"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      expect(screen.getByText("Alert Title")).toBeInTheDocument();
    });

    it("should only show OK button", () => {
      render(
        <AlertDialog type="alert" visible={true} message="Message" onConfirm={() => {}} onCancel={() => {}} />,
      );

      expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    });

    it("should call onConfirm when OK is clicked", () => {
      const onConfirm = vi.fn();
      render(
        <AlertDialog type="alert" visible={true} message="Message" onConfirm={onConfirm} onCancel={() => {}} />,
      );

      fireEvent.click(screen.getByRole("button", { name: "OK" }));

      expect(onConfirm).toHaveBeenCalled();
    });

    it("should use custom confirmLabel", () => {
      render(
        <AlertDialog
          type="alert"
          visible={true}
          message="Message"
          confirmLabel="Got it"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      expect(screen.getByRole("button", { name: "Got it" })).toBeInTheDocument();
    });
  });

  describe("confirm type", () => {
    it("should show OK and Cancel buttons", () => {
      render(
        <AlertDialog type="confirm" visible={true} message="Are you sure?" onConfirm={() => {}} onCancel={() => {}} />,
      );

      expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("should call onConfirm when OK is clicked", () => {
      const onConfirm = vi.fn();
      render(
        <AlertDialog type="confirm" visible={true} message="Are you sure?" onConfirm={onConfirm} onCancel={() => {}} />,
      );

      fireEvent.click(screen.getByRole("button", { name: "OK" }));

      expect(onConfirm).toHaveBeenCalled();
    });

    it("should call onCancel when Cancel is clicked", () => {
      const onCancel = vi.fn();
      render(
        <AlertDialog type="confirm" visible={true} message="Are you sure?" onConfirm={() => {}} onCancel={onCancel} />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onCancel).toHaveBeenCalled();
    });

    it("should call onCancel when backdrop is clicked", () => {
      const onCancel = vi.fn();
      render(
        <AlertDialog type="confirm" visible={true} message="Are you sure?" onConfirm={() => {}} onCancel={onCancel} />,
      );

      const dialog = document.querySelector("dialog");
      fireEvent.click(dialog!);

      expect(onCancel).toHaveBeenCalled();
    });

    it("should use custom button labels", () => {
      render(
        <AlertDialog
          type="confirm"
          visible={true}
          message="Delete?"
          confirmLabel="Delete"
          cancelLabel="Keep"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument();
    });
  });

  describe("prompt type", () => {
    it("should show input field", () => {
      render(
        <AlertDialog
          type="prompt"
          visible={true}
          message="Enter your name:"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should show placeholder", () => {
      render(
        <AlertDialog
          type="prompt"
          visible={true}
          message="Enter your name:"
          placeholder="John Doe"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "John Doe");
    });

    it("should show default value", () => {
      render(
        <AlertDialog
          type="prompt"
          visible={true}
          message="Enter your name:"
          defaultValue="Initial Value"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      expect(screen.getByRole("textbox")).toHaveValue("Initial Value");
    });

    it("should update input value on change", () => {
      render(
        <AlertDialog
          type="prompt"
          visible={true}
          message="Enter your name:"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "Test Value" } });

      expect(input.value).toBe("Test Value");
    });

    it("should call onConfirm with input value when OK is clicked", () => {
      const onConfirm = vi.fn();
      render(
        <AlertDialog
          type="prompt"
          visible={true}
          message="Enter your name:"
          defaultValue="Hello"
          onConfirm={onConfirm}
          onCancel={() => {}}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "OK" }));

      expect(onConfirm).toHaveBeenCalledWith("Hello");
    });

    it("should call onConfirm with changed input value", () => {
      const onConfirm = vi.fn();
      render(
        <AlertDialog
          type="prompt"
          visible={true}
          message="Enter your name:"
          onConfirm={onConfirm}
          onCancel={() => {}}
        />,
      );

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "Changed Value" } });
      fireEvent.click(screen.getByRole("button", { name: "OK" }));

      expect(onConfirm).toHaveBeenCalledWith("Changed Value");
    });

    it("should call onConfirm when Enter is pressed in input", () => {
      const onConfirm = vi.fn();
      render(
        <AlertDialog
          type="prompt"
          visible={true}
          message="Enter your name:"
          defaultValue="Test"
          onConfirm={onConfirm}
          onCancel={() => {}}
        />,
      );

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "Enter" });

      expect(onConfirm).toHaveBeenCalledWith("Test");
    });

    it("should call onCancel when Cancel is clicked", () => {
      const onCancel = vi.fn();
      render(
        <AlertDialog
          type="prompt"
          visible={true}
          message="Enter your name:"
          onConfirm={() => {}}
          onCancel={onCancel}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onCancel).toHaveBeenCalled();
    });

    it("should support password input type", () => {
      render(
        <AlertDialog
          type="prompt"
          visible={true}
          message="Enter password:"
          inputType="password"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      const input = screen.getByLabelText("Input");
      expect(input).toHaveAttribute("type", "password");
    });

    it("should focus input when dialog opens", async () => {
      render(
        <AlertDialog
          type="prompt"
          visible={true}
          message="Enter your name:"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      const input = screen.getByRole("textbox");
      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });
    });

    it("should reset input value when dialog reopens", () => {
      const { rerender } = render(
        <AlertDialog
          type="prompt"
          visible={true}
          message="Enter your name:"
          defaultValue="Initial"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "Changed" } });
      expect(input.value).toBe("Changed");

      // Close and reopen
      rerender(
        <AlertDialog
          type="prompt"
          visible={false}
          message="Enter your name:"
          defaultValue="Initial"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      rerender(
        <AlertDialog
          type="prompt"
          visible={true}
          message="Enter your name:"
          defaultValue="Initial"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      expect(input.value).toBe("Initial");
    });
  });
});
