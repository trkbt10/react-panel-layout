/**
 * @file Tests for useDialog hook
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { useDialog } from "./useDialog";

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

describe("useDialog", () => {
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

  const TestComponent: React.FC<{
    onAlert?: () => void;
    onConfirm?: (result: boolean) => void;
    onPrompt?: (result: string | null) => void;
  }> = ({ onAlert, onConfirm, onPrompt }) => {
    const { alert, confirm, prompt, Outlet } = useDialog();

    const handleAlert = async () => {
      await alert("Test alert message");
      onAlert?.();
    };

    const handleConfirm = async () => {
      const result = await confirm("Test confirm message");
      onConfirm?.(result);
    };

    const handlePrompt = async () => {
      const result = await prompt("Test prompt message");
      onPrompt?.(result);
    };

    return (
      <div>
        <button data-testid="alert-btn" onClick={handleAlert}>
          Alert
        </button>
        <button data-testid="confirm-btn" onClick={handleConfirm}>
          Confirm
        </button>
        <button data-testid="prompt-btn" onClick={handlePrompt}>
          Prompt
        </button>
        <Outlet />
      </div>
    );
  };

  describe("alert", () => {
    it("should show alert dialog with message", async () => {
      render(<TestComponent />);

      fireEvent.click(screen.getByTestId("alert-btn"));

      await waitFor(() => {
        expect(screen.getByText("Test alert message")).toBeInTheDocument();
      });
    });

    it("should resolve when OK is clicked", async () => {
      const onAlert = createCallTracker();
      render(<TestComponent onAlert={onAlert.fn} />);

      fireEvent.click(screen.getByTestId("alert-btn"));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "OK" }));

      await waitFor(() => {
        expect(onAlert.calls).toHaveLength(1);
      });
    });

    it("should accept string as shorthand", async () => {
      const TestStringAlert: React.FC = () => {
        const { alert, Outlet } = useDialog();
        return (
          <div>
            <button onClick={() => alert("Simple message")}>Alert</button>
            <Outlet />
          </div>
        );
      };

      render(<TestStringAlert />);
      fireEvent.click(screen.getByRole("button", { name: "Alert" }));

      await waitFor(() => {
        expect(screen.getByText("Simple message")).toBeInTheDocument();
      });
    });
  });

  describe("confirm", () => {
    it("should show confirm dialog with message", async () => {
      render(<TestComponent />);

      fireEvent.click(screen.getByTestId("confirm-btn"));

      await waitFor(() => {
        expect(screen.getByText("Test confirm message")).toBeInTheDocument();
      });
    });

    it("should resolve with true when OK is clicked", async () => {
      const onConfirm = createCallTracker();
      render(<TestComponent onConfirm={onConfirm.fn} />);

      fireEvent.click(screen.getByTestId("confirm-btn"));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "OK" }));

      await waitFor(() => {
        expect(onConfirm.calls).toHaveLength(1);
        expect(onConfirm.calls[0]?.[0]).toBe(true);
      });
    });

    it("should resolve with false when Cancel is clicked", async () => {
      const onConfirm = createCallTracker();
      render(<TestComponent onConfirm={onConfirm.fn} />);

      fireEvent.click(screen.getByTestId("confirm-btn"));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      await waitFor(() => {
        expect(onConfirm.calls).toHaveLength(1);
        expect(onConfirm.calls[0]?.[0]).toBe(false);
      });
    });

    it("should resolve with false when backdrop is clicked", async () => {
      const onConfirm = createCallTracker();
      render(<TestComponent onConfirm={onConfirm.fn} />);

      fireEvent.click(screen.getByTestId("confirm-btn"));

      await waitFor(() => {
        expect(screen.getByText("Test confirm message")).toBeInTheDocument();
      });

      const dialog = document.querySelector("dialog");
      fireEvent.click(dialog!);

      await waitFor(() => {
        expect(onConfirm.calls).toHaveLength(1);
        expect(onConfirm.calls[0]?.[0]).toBe(false);
      });
    });
  });

  describe("prompt", () => {
    it("should show prompt dialog with message and input", async () => {
      render(<TestComponent />);

      fireEvent.click(screen.getByTestId("prompt-btn"));

      await waitFor(() => {
        expect(screen.getByText("Test prompt message")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
    });

    it("should resolve with input value when OK is clicked", async () => {
      const onPrompt = createCallTracker();
      render(<TestComponent onPrompt={onPrompt.fn} />);

      fireEvent.click(screen.getByTestId("prompt-btn"));

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "Test input" } });
      fireEvent.click(screen.getByRole("button", { name: "OK" }));

      await waitFor(() => {
        expect(onPrompt.calls).toHaveLength(1);
        expect(onPrompt.calls[0]?.[0]).toBe("Test input");
      });
    });

    it("should resolve with null when Cancel is clicked", async () => {
      const onPrompt = createCallTracker();
      render(<TestComponent onPrompt={onPrompt.fn} />);

      fireEvent.click(screen.getByTestId("prompt-btn"));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      await waitFor(() => {
        expect(onPrompt.calls).toHaveLength(1);
        expect(onPrompt.calls[0]?.[0]).toBe(null);
      });
    });

    it("should resolve with null when backdrop is clicked", async () => {
      const onPrompt = createCallTracker();
      render(<TestComponent onPrompt={onPrompt.fn} />);

      fireEvent.click(screen.getByTestId("prompt-btn"));

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });

      const dialog = document.querySelector("dialog");
      fireEvent.click(dialog!);

      await waitFor(() => {
        expect(onPrompt.calls).toHaveLength(1);
        expect(onPrompt.calls[0]?.[0]).toBe(null);
      });
    });
  });

  describe("queue behavior", () => {
    it("should queue multiple dialogs and show one at a time", async () => {
      const results: string[] = [];

      const QueueTest: React.FC = () => {
        const { alert, Outlet } = useDialog();

        const handleClick = async () => {
          await alert("First");
          results.push("first done");
          await alert("Second");
          results.push("second done");
          await alert("Third");
          results.push("third done");
        };

        return (
          <div>
            <button onClick={handleClick}>Show All</button>
            <Outlet />
          </div>
        );
      };

      render(<QueueTest />);

      fireEvent.click(screen.getByRole("button", { name: "Show All" }));

      // First dialog
      await waitFor(() => {
        expect(screen.getByText("First")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "OK" }));

      // Second dialog
      await waitFor(() => {
        expect(screen.getByText("Second")).toBeInTheDocument();
      });
      expect(results).toContain("first done");

      fireEvent.click(screen.getByRole("button", { name: "OK" }));

      // Third dialog
      await waitFor(() => {
        expect(screen.getByText("Third")).toBeInTheDocument();
      });
      expect(results).toContain("second done");

      fireEvent.click(screen.getByRole("button", { name: "OK" }));

      await waitFor(() => {
        expect(results).toContain("third done");
      });
    });

    it("should handle multiple dialogs triggered simultaneously", async () => {
      const results: (boolean | string | null)[] = [];

      const SimultaneousTest: React.FC = () => {
        const { confirm, prompt, Outlet } = useDialog();

        const handleClick = () => {
          confirm("First?").then((r) => results.push(r));
          prompt("Second?").then((r) => results.push(r));
        };

        return (
          <div>
            <button onClick={handleClick}>Show All</button>
            <Outlet />
          </div>
        );
      };

      render(<SimultaneousTest />);

      fireEvent.click(screen.getByRole("button", { name: "Show All" }));

      // First dialog (confirm)
      await waitFor(() => {
        expect(screen.getByText("First?")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "OK" }));

      // Second dialog (prompt)
      await waitFor(() => {
        expect(screen.getByText("Second?")).toBeInTheDocument();
      });

      expect(results[0]).toBe(true);

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      await waitFor(() => {
        expect(results[1]).toBeNull();
      });
    });
  });

  describe("options", () => {
    it("should use custom title", async () => {
      const TestTitle: React.FC = () => {
        const { alert, Outlet } = useDialog();
        return (
          <div>
            <button onClick={() => alert({ title: "Custom Title", message: "Message" })}>Alert</button>
            <Outlet />
          </div>
        );
      };

      render(<TestTitle />);
      fireEvent.click(screen.getByRole("button", { name: "Alert" }));

      await waitFor(() => {
        expect(screen.getByText("Custom Title")).toBeInTheDocument();
      });
    });

    it("should use custom button labels", async () => {
      const TestLabels: React.FC = () => {
        const { confirm, Outlet } = useDialog();
        return (
          <div>
            <button
              onClick={() =>
                confirm({
                  message: "Confirm?",
                  confirmLabel: "Yes",
                  cancelLabel: "No",
                })
              }
            >
              Confirm
            </button>
            <Outlet />
          </div>
        );
      };

      render(<TestLabels />);
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
      });
    });

    it("should use prompt options", async () => {
      const TestPromptOptions: React.FC = () => {
        const { prompt, Outlet } = useDialog();
        return (
          <div>
            <button
              onClick={() =>
                prompt({
                  message: "Enter:",
                  defaultValue: "default",
                  placeholder: "placeholder",
                  inputType: "password",
                })
              }
            >
              Prompt
            </button>
            <Outlet />
          </div>
        );
      };

      render(<TestPromptOptions />);
      fireEvent.click(screen.getByRole("button", { name: "Prompt" }));

      await waitFor(() => {
        const input = screen.getByPlaceholderText("placeholder") as HTMLInputElement;
        expect(input.value).toBe("default");
        expect(input.type).toBe("password");
      });
    });
  });
});
