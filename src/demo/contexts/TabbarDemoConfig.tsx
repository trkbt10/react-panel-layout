/**
 * @file Demo-only context to inject TabBar add/close button components and placement.
 */
import * as React from "react";

export type AddButtonPlacement = "trailing" | "after-active";

export type DemoTabbarConfig = {
  addPlacement: AddButtonPlacement;
  AddButton?: React.ComponentType<{ onClick: () => void; ariaLabel?: string; className?: string }>
  CloseButton?: React.ComponentType<{ onClick: (e: React.MouseEvent) => void; ariaLabel?: string; className?: string }>
};

const defaultConfig: DemoTabbarConfig = {
  addPlacement: "trailing",
};

const Ctx = React.createContext<DemoTabbarConfig>(defaultConfig);

export const DemoTabbarConfigProvider: React.FC<React.PropsWithChildren<{ value: DemoTabbarConfig }>> = ({ value, children }) => {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useDemoTabbarConfig = (): DemoTabbarConfig => React.useContext(Ctx);

