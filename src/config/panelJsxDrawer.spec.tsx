/**
 * @file Unit tests for JSX Panel type="drawer"
 */
import * as React from "react";
import { buildRoutesFromChildren, Panel } from "./PanelContentDeclaration";
import { buildLayersFromRoutes } from "./panelRouter";

describe("panelJsx drawer", () => {
  it("collects drawer panels with config and options", () => {
    const tree = (
      <>
        <Panel
          type="drawer"
          id="nav"
          drawer={{ defaultOpen: true, dismissible: true, header: { title: "Nav" } }}
          position={{ left: 0 }}
          width={280}
          backdropStyle={{ backgroundColor: "rgba(0,0,0,0.2)" }}
        >
          <div>drawer</div>
        </Panel>
      </>
    );

    const routes = buildRoutesFromChildren(tree);
    const layers = buildLayersFromRoutes(routes);
    const layer = layers[0];
    expect(layer.drawer?.header?.title).toBe("Nav");
    expect(layer.width).toBe(280);
    expect(layer.position?.left).toBe(0);
    expect(layer.backdropStyle).toBeTruthy();
  });
});
