/**
 * @file Generic transition state management with animation support.
 */
import * as React from "react";

export type TransitionMode = "none" | "css";

export type TransitionOptions = {
  mode?: TransitionMode;
  element?: React.RefObject<HTMLElement>;
  duration?: number;
};

export type UseTransitionStateOptions = {
  onOpen?: (id: string) => void;
  onClose?: (id: string) => void;
  onTransitionEnd?: (id: string, isOpen: boolean) => void;
};

const waitForTransitionEnd = (el: HTMLElement, timeout: number): Promise<void> =>
  new Promise((resolve) => {
    // eslint-disable-next-line no-restricted-syntax -- mutable flag needed for deduplication
    let resolved = false;
    const done = () => {
      if (resolved) {return;}
      resolved = true;
      el.removeEventListener("transitionend", handler);
      resolve();
    };
    const handler = (e: TransitionEvent) => {
      if (e.target === el) {done();}
    };
    el.addEventListener("transitionend", handler);
    setTimeout(done, timeout + 50);
  });

export const runTransition = async (
  update: () => void,
  mode: TransitionMode,
  el: HTMLElement | null | undefined,
  duration: number,
): Promise<void> => {
  switch (mode) {
    case "none":
      update();
      return;

    case "css":
      update();
      if (el) {await waitForTransitionEnd(el, duration);}
      return;
  }
};

export const useTransitionState = (options?: UseTransitionStateOptions) => {
  const [states, setStates] = React.useState<Record<string, boolean>>({});
  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  const update = React.useCallback(
    async (id: string, isOpen: boolean, transitionOptions?: TransitionOptions) => {
      const { mode = "none", element, duration = 300 } = transitionOptions ?? {};

      const applyState = () => {
        setStates((prev) => {
          if (prev[id] === isOpen) {return prev;}
          return { ...prev, [id]: isOpen };
        });
      };

      await runTransition(applyState, mode, element?.current, duration);

      const opts = optionsRef.current;
      if (isOpen) {
        opts?.onOpen?.(id);
      } else {
        opts?.onClose?.(id);
      }
      opts?.onTransitionEnd?.(id, isOpen);
    },
    [],
  );

  const state = React.useCallback((id: string): boolean => states[id] ?? false, [states]);
  const open = React.useCallback(
    (id: string, opts?: TransitionOptions) => update(id, true, opts),
    [update],
  );
  const close = React.useCallback(
    (id: string, opts?: TransitionOptions) => update(id, false, opts),
    [update],
  );

  return { state, open, close };
};
