/**
 * @file Registers default keybindings using the single-source commands.
 */
import * as React from "react";
import { useKeybindings, registerDefaultBindings } from "../../keybindings/KeybindingsProvider";
import { usePanelCommands } from "../commands/commands";

export const DefaultKeybindingsInstaller: React.FC = () => {
  const api = useKeybindings();
  const commands = usePanelCommands();
  React.useEffect(() => {
    registerDefaultBindings(api, commands);
  }, [api, commands]);
  return null;
};
