/**
 * @file Central keybindings provider for PanelSystem.
 * Belongs to modules: distributes a single source of keybindings to UI.
 */
import * as React from "react";
import type { PanelCommands } from "../panels/state/types";

export type KeyCombo = string; // e.g., "Mod-Shift-\\", "Mod-1"

export type KeybindingsMap = Record<KeyCombo, (e: KeyboardEvent) => void>;

export type KeybindingsContextValue = {
  register: (combo: KeyCombo, handler: (e: KeyboardEvent) => void) => void;
  unregister: (combo: KeyCombo) => void;
};

const KeybindingsContext = React.createContext<KeybindingsContextValue | null>(null);

export const useKeybindings = (): KeybindingsContextValue => {
  const ctx = React.useContext(KeybindingsContext);
  if (!ctx) {
    throw new Error("useKeybindings must be used within KeybindingsProvider");
  }
  return ctx;
};

const normalizeEventToCombo = (e: KeyboardEvent): KeyCombo => {
  const parts: string[] = [];
  if (e.metaKey) {
    parts.push("Mod");
  }
  if (e.ctrlKey) {
    parts.push("Ctrl");
  }
  if (e.altKey) {
    parts.push("Alt");
  }
  if (e.shiftKey) {
    parts.push("Shift");
  }
  const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  parts.push(key);
  return parts.join("-");
};

export const KeybindingsProvider: React.FC<React.PropsWithChildren<{ configure?: (api: KeybindingsContextValue) => void }>> = ({ children, configure }) => {
  const handlersRef = React.useRef<KeybindingsMap>({});

  const register = React.useCallback((combo: KeyCombo, handler: (e: KeyboardEvent) => void): void => {
    handlersRef.current = { ...handlersRef.current, [combo]: handler };
  }, []);

  const unregister = React.useCallback((combo: KeyCombo): void => {
    const rest = { ...handlersRef.current };
    delete (rest as Record<string, unknown>)[combo];
    handlersRef.current = rest;
  }, []);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      const combo = normalizeEventToCombo(e);
      const handler = handlersRef.current[combo];
      if (!handler) {
        return;
      }
      handler(e);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const api: KeybindingsContextValue = React.useMemo(() => ({ register, unregister }), [register, unregister]);

  React.useEffect(() => {
    if (!configure) {
      return;
    }
    configure(api);
  }, [api, configure]);

  return <KeybindingsContext.Provider value={api}>{children}</KeybindingsContext.Provider>;
};

export const registerDefaultBindings = (api: KeybindingsContextValue, commands: PanelCommands): void => {
  api.register("Mod-\\", (e) => {
    e.preventDefault();
    commands.splitFocused("vertical");
  });
  api.register("Mod-Shift-\\", (e) => {
    e.preventDefault();
    commands.splitFocused("horizontal");
  });

  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    api.register(`Mod-${String(n)}`, (e) => {
      e.preventDefault();
      commands.focusGroupIndex(n);
    });
  }

  api.register("Alt-ArrowRight", (e) => {
    e.preventDefault();
    commands.focusNextGroup();
  });
  api.register("Alt-ArrowLeft", (e) => {
    e.preventDefault();
    commands.focusPrevGroup();
  });
};
