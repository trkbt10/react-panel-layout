/**
 * @file Config utilities entry point for JSX-based panel configuration
 *
 * This module provides JSX DSL components for declarative panel configuration.
 * Import from 'react-panel-layout/config' to use these utilities.
 *
 * @example
 * ```tsx
 * import { PanelLayout, Config, Rows, Row, Columns, Col, Areas, Panel } from 'react-panel-layout/config';
 *
 * <PanelLayout>
 *   <Config>
 *     <Rows>
 *       <Row size="1fr" />
 *       <Row size="2fr" />
 *     </Rows>
 *     <Columns>
 *       <Col size="200px" />
 *       <Col size="1fr" />
 *     </Columns>
 *     <Areas matrix={[
 *       ['sidebar', 'main'],
 *       ['sidebar', 'main']
 *     ]} />
 *   </Config>
 *   <Panel type="grid" id="sidebar" area="sidebar">Sidebar</Panel>
 *   <Panel type="grid" id="main" area="main">Main</Panel>
 * </PanelLayout>
 * ```
 */

export {
  PanelLayout,
  Panel,
  buildRoutesFromChildren,
  Config,
  Rows,
  Row,
  Columns,
  Col,
  Areas,
  buildConfigFromChildren,
} from "./PanelContentDeclaration";

export type {
  PanelRootProps,
  PanelProps,
  ConfigProps,
  RowProps,
  ColumnProps,
  AreasProps,
} from "./PanelContentDeclaration";
