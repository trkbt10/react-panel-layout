/**
 * @file Context exposing the current grid layer id to child components.
 */
import * as React from "react";

type LayerInstanceContextValue = {
  layerId: string;
};

const LayerInstanceContext = React.createContext<LayerInstanceContextValue | null>(null);

export type LayerInstanceProviderProps = React.PropsWithChildren<LayerInstanceContextValue>;

export const LayerInstanceProvider: React.FC<LayerInstanceProviderProps> = ({ layerId, children }) => {
  const value = React.useMemo(() => ({ layerId }), [layerId]);
  return <LayerInstanceContext.Provider value={value}>{children}</LayerInstanceContext.Provider>;
};

export const useLayerInstance = (): LayerInstanceContextValue => {
  const value = React.useContext(LayerInstanceContext);
  if (!value) {
    throw new Error("useLayerInstance must be used within a LayerInstanceProvider.");
  }
  return value;
};

