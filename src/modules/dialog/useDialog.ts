/**
 * @file useDialog hook for imperative alert/confirm/prompt dialogs
 */
import * as React from "react";
import type {
  AlertOptions,
  ConfirmOptions,
  PromptOptions,
  DialogQueueItem,
  UseDialogReturn,
} from "./types";
import { AlertDialog } from "./AlertDialog";

type DialogState = {
  queue: DialogQueueItem[];
  current: DialogQueueItem | null;
};

const normalizeAlertOptions = (options: AlertOptions | string): AlertOptions => {
  if (typeof options === "string") {
    return { message: options };
  }
  return options;
};

const normalizeConfirmOptions = (options: ConfirmOptions | string): ConfirmOptions => {
  if (typeof options === "string") {
    return { message: options };
  }
  return options;
};

const normalizePromptOptions = (options: PromptOptions | string): PromptOptions => {
  if (typeof options === "string") {
    return { message: options };
  }
  return options;
};

/**
 * Hook for imperative alert/confirm/prompt dialogs.
 *
 * Returns functions to show dialogs and an Outlet component that must be rendered.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { alert, confirm, prompt, Outlet } = useDialog();
 *
 *   const handleClick = async () => {
 *     await alert("Hello!");
 *
 *     const confirmed = await confirm({
 *       message: "Are you sure?",
 *       confirmLabel: "Yes",
 *       cancelLabel: "No",
 *     });
 *
 *     if (confirmed) {
 *       const name = await prompt({
 *         message: "Enter your name:",
 *         defaultValue: "Anonymous",
 *       });
 *       console.log("Name:", name);
 *     }
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleClick}>Show dialogs</button>
 *       <Outlet />
 *     </>
 *   );
 * }
 * ```
 */
export const useDialog = (): UseDialogReturn => {
  const [state, setState] = React.useState<DialogState>({
    queue: [],
    current: null,
  });

  // Process queue when current dialog is closed
  const processQueue = React.useCallback(() => {
    setState((prev) => {
      if (prev.queue.length === 0) {
        return { ...prev, current: null };
      }
      const [next, ...rest] = prev.queue;
      return { queue: rest, current: next };
    });
  }, []);

  // Add to queue or show immediately if no current dialog
  const enqueue = React.useCallback((item: DialogQueueItem) => {
    setState((prev) => {
      if (prev.current === null) {
        return { ...prev, current: item };
      }
      return { ...prev, queue: [...prev.queue, item] };
    });
  }, []);

  const alert = React.useCallback(
    (options: AlertOptions | string): Promise<void> => {
      return new Promise<void>((resolve) => {
        const normalized = normalizeAlertOptions(options);
        enqueue({
          type: "alert",
          options: normalized,
          resolve,
        });
      });
    },
    [enqueue],
  );

  const confirm = React.useCallback(
    (options: ConfirmOptions | string): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        const normalized = normalizeConfirmOptions(options);
        enqueue({
          type: "confirm",
          options: normalized,
          resolve,
        });
      });
    },
    [enqueue],
  );

  const prompt = React.useCallback(
    (options: PromptOptions | string): Promise<string | null> => {
      return new Promise<string | null>((resolve) => {
        const normalized = normalizePromptOptions(options);
        enqueue({
          type: "prompt",
          options: normalized,
          resolve,
        });
      });
    },
    [enqueue],
  );

  const handleConfirm = React.useCallback(
    (value?: string) => {
      const current = state.current;
      if (!current) {
        return;
      }

      if (current.type === "alert") {
        current.resolve();
      } else if (current.type === "confirm") {
        current.resolve(true);
      } else if (current.type === "prompt") {
        current.resolve(value ?? "");
      }

      processQueue();
    },
    [state.current, processQueue],
  );

  const handleCancel = React.useCallback(() => {
    const current = state.current;
    if (!current) {
      return;
    }

    if (current.type === "alert") {
      current.resolve();
    } else if (current.type === "confirm") {
      current.resolve(false);
    } else if (current.type === "prompt") {
      current.resolve(null);
    }

    processQueue();
  }, [state.current, processQueue]);

  const Outlet: React.FC = React.useCallback(() => {
    const current = state.current;
    if (!current) {
      return null;
    }

    const { type, options } = current;

    return React.createElement(AlertDialog, {
      type,
      visible: true,
      title: options.title,
      message: options.message,
      confirmLabel: type === "alert" ? (options as AlertOptions).okLabel : (options as ConfirmOptions).confirmLabel,
      cancelLabel: (options as ConfirmOptions).cancelLabel,
      placeholder: (options as PromptOptions).placeholder,
      defaultValue: (options as PromptOptions).defaultValue,
      inputType: (options as PromptOptions).inputType,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    });
  }, [state.current, handleConfirm, handleCancel]);

  return {
    alert,
    confirm,
    prompt,
    Outlet,
  };
};
