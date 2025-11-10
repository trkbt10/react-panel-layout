/**
 * @file Unit tests for JSX-based panel declarations
 */
import * as React from "react";
import { buildRoutesFromChildren, Panel } from "./PanelContentDeclaration";
import { buildLayersFromRoutes } from "./panelRouter";

// layout config is not required for this unit test; routes are converted independently

describe("panelJsx", () => {
  it("collects grid and floating routes", () => {
    const tree = (
      <>
        <Panel type="grid" id="toolbar" area="toolbar"><div>TB</div></Panel>
        <Panel type="grid" id="sidebar" area="sidebar"><div>SB</div></Panel>
        <Panel type="grid" id="canvas" area="canvas"><div>CV</div></Panel>
        <Panel type="floating" id="preview" position={{ left: 10, top: 20 }} width={200} height={100} draggable>
          <div>PV</div>
        </Panel>
      </>
    );

    const routes = buildRoutesFromChildren(tree);
    expect(routes).toHaveLength(4);
    const layers = buildLayersFromRoutes(routes);
    expect(layers).toHaveLength(4);
    expect(layers.find((l) => l.id === "toolbar")?.gridArea).toBe("toolbar");
    expect(layers.find((l) => l.id === "preview")?.floating?.draggable).toBe(true);
  });

  it("throws on missing area for grid", () => {
    const tree = (
      <>
        {/* @ts-expect-error intentional missing area */}
        <Panel type="grid" id="x">x</Panel>
      </>
    );
    expect(() => buildRoutesFromChildren(tree)).toThrow(/requires an explicit 'area'/i);
  });

  it("throws when floating missing size/position", () => {
    const noSize = (
      // @ts-expect-error intentionally missing width/height
      <Panel type="floating" id="f" position={{ left: 0, top: 0 }}>x</Panel>
    );
    expect(() => buildRoutesFromChildren(noSize)).toThrow(/requires 'width' and 'height'/i);

    const noPos = (
      // @ts-expect-error intentionally missing position
      <Panel type="floating" id="f" width={100} height={100}>x</Panel>
    );
    expect(() => buildRoutesFromChildren(noPos)).toThrow(/requires a 'position'/i);
  });
});
