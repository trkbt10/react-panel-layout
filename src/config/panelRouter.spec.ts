/**
 * @file Unit tests for router-like builder
 */
import * as React from "react";
import type { PanelLayoutConfig } from "../types";
import { buildLayersFromRoutes, createPanelLayoutFromRoutes, type PanelRoute } from "./panelRouter";

const baseConfig: PanelLayoutConfig = {
  areas: [
    ["toolbar", "toolbar"],
    ["main", "side"],
  ],
  rows: [{ size: "40px" }, { size: "1fr" }],
  columns: [{ size: "1fr" }, { size: "300px" }],
  gap: "0",
};

describe("panelRouter", () => {
  it("builds a single grid layer from routes", () => {
    const routes: PanelRoute[] = [
      { id: "toolbar", area: "toolbar", element: React.createElement("div", null, "TB") },
    ];
    const layers = buildLayersFromRoutes(routes);
    expect(layers).toHaveLength(1);
    expect(layers[0].id).toBe("toolbar");
    expect(layers[0].gridArea).toBe("toolbar");
    expect(layers[0].component).toBeDefined();
  });

  it("flattens nested routes", () => {
    const routes: PanelRoute[] = [
      {
        id: "main",
        area: "main",
        element: React.createElement("div", null, "Main"),
        children: [
          { id: "side", area: "side", element: React.createElement("div", null, "Side") },
        ],
      },
    ];
    const layers = buildLayersFromRoutes(routes);
    expect(layers.map((l) => l.id)).toEqual(["main", "side"]);
  });

  it("throws if grid route is missing area", () => {
    const routes: PanelRoute[] = [{ id: "x", element: React.createElement("div") }];
    expect(() => buildLayersFromRoutes(routes)).toThrow(/must specify 'area'/i);
  });

  it("throws on duplicate ids", () => {
    const routes: PanelRoute[] = [
      { id: "dup", area: "main", element: React.createElement("div") },
      { id: "dup", area: "side", element: React.createElement("div") },
    ];
    expect(() => buildLayersFromRoutes(routes)).toThrow(/duplicate panelroute id/i);
  });

  it("builds out a full PanelLayoutProps from routes", () => {
    const routes: PanelRoute[] = [
      { id: "toolbar", area: "toolbar", element: React.createElement("div") },
      { id: "main", area: "main", element: React.createElement("div") },
      { id: "side", area: "side", element: React.createElement("div") },
    ];
    const props = createPanelLayoutFromRoutes({ config: baseConfig, routes });
    expect(props.config).toBe(baseConfig);
    expect(props.layers).toHaveLength(3);
  });
});
