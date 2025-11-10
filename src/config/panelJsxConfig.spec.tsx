/**
 * @file Unit tests for JSX config builder
 */
import * as React from "react";
import { Areas, Col, Config, Row, Rows, Columns, buildConfigFromChildren } from "./PanelContentDeclaration";

describe("panelJsx config", () => {
  it("builds config from JSX children", () => {
    const tree = (
      <Config gap="0">
        <Rows>
          <Row size="60px" />
          <Row size="1fr" />
          <Row size="30px" />
        </Rows>
        <Columns>
          <Col size="250px" resizable minSize={200} maxSize={400} />
          <Col size="1fr" />
          <Col size="300px" resizable minSize={250} maxSize={500} />
        </Columns>
        <Areas
          matrix={[
            ["toolbar", "toolbar", "toolbar"],
            ["sidebar", "canvas", "inspector"],
            ["statusbar", "statusbar", "statusbar"],
          ]}
        />
      </Config>
    );

    const cfg = buildConfigFromChildren(tree);
    expect(cfg).toBeTruthy();
    expect(cfg?.rows.length).toBe(3);
    expect(cfg?.columns.length).toBe(3);
    expect(cfg?.areas[0][0]).toBe("toolbar");
  });

  it("throws when areas/rows/cols counts mismatch", () => {
    const bad = (
      <Config>
        <Rows>
          <Row size="60px" />
          <Row size="1fr" />
        </Rows>
        <Columns>
          <Col size="1fr" />
        </Columns>
        <Areas matrix={[["a", "b"], ["c", "d"], ["e", "f"]]} />
      </Config>
    );

    expect(() => buildConfigFromChildren(bad)).toThrow(/row count/i);
  });
});
