# React Panel Layout

> A flexible and customizable panel layout system for React applications

## 🎨 Live Demo

**[View Live Demo →](https://trkbt10.github.io/react-panel-layout/)**

Explore interactive examples of all components, including:
- Panel layouts with resizable grids
- Tab systems with drag & drop
- Floating panels and overlays
- Various UI patterns and configurations

---

## Panel System – Customizing Look & Feel

This library ships with a default, raised-style tab bar and matching panel shell. You can change both the appearance and structure without forking by providing your own React components and/or CSS variables (design tokens).

### Quick Start

```tsx
import { PanelSystem, buildInitialState } from "react-panel-layout";

const state = buildInitialState([{ id: "welcome", title: "Welcome", render: () => <div>Welcome</div> }]);

<PanelSystem
  initialState={state}
  createGroupId={() => "g_2"}
  layoutMode="grid"
  gridTracksInteractive={false}
  dragThresholdPx={6}
/>;
```

### Provide Your Own Tab Bar

Pass a React component via `tabBarComponent`. Your component receives the following props:

- `group`: the current group model
- `onClickTab(tabId)`: activate a tab
- `onStartDrag?(tabId, groupId, e)`: start tab drag
- `rootRef?`: assign to the tabbar root element (DnD uses this ref)

```tsx
import type { TabBarRenderProps } from "react-panel-layout";

const MyTabBar: React.FC<TabBarRenderProps> = ({ group, onClickTab, onStartDrag, rootRef }) => (
  <div ref={rootRef} role="tablist">
    {group.tabs.map((t, i) => (
      <button
        key={t.id + i}
        role="tab"
        aria-selected={group.activeTabId === t.id}
        onClick={() => onClickTab(t.id)}
        onPointerDown={(e) => onStartDrag?.(t.id, group.id, e)}
      >
        {t.title}
      </button>
    ))}
  </div>
);

<PanelSystem tabBarComponent={MyTabBar} {...commonProps} />;
```

### Provide Your Own Panel Shell

Pass a React component via `panelGroupComponent`. Your component receives:

- `group`: the current group model
- `tabbar`: render node for the tab bar
- `content`: active tab content rendered via context (already memoized)
- `onContentPointerDown?`: pointer handler for content drag-to-split
- `groupRef?`, `contentRef?`: assign to wrappers so DnD can compute hit testing

```tsx
import type { PanelGroupRenderProps } from "react-panel-layout";

const MyPanelShell: React.FC<PanelGroupRenderProps> = ({
  group,
  tabbar,
  content,
  onContentPointerDown,
  groupRef,
  contentRef,
}) => (
  <section ref={groupRef} data-group-id={group.id}>
    {tabbar}
    <div ref={contentRef} onPointerDown={onContentPointerDown}>
      {content}
    </div>
  </section>
);

<PanelSystem panelGroupComponent={MyPanelShell} {...commonProps} />;
```

### Design Tokens (Colors, Sizes)

Customize the appearance using CSS variables. Override them in your stylesheet to match your design system.

```css
:root {
  --rpl-color-primary: #3b82f6;
  --rpl-color-tabbar-bg: #202227;
  --rpl-color-tab-active-bg: #2f323a;
  --rpl-radius-tab: 8px;
  --rpl-size-tab-font: 14px;
}
```

All available CSS variables are documented in [docs/design-tokens.md](./docs/design-tokens.md).

**Quick Examples:**

- Brand colors: Set `--rpl-color-primary` to your brand color
- Larger UI: Increase `--rpl-size-tab-font` and spacing variables
- Light theme: Override color variables for light backgrounds
- VS Code style: See examples in the design tokens documentation

---

## Grid Layout – Flexible Grid-Based Layouts

`GridLayout` provides a declarative way to create complex grid-based layouts with resizable tracks and floating overlays.

### Quick Start

```tsx
import { GridLayout } from "react-panel-layout";
import type { PanelLayoutConfig, LayerDefinition } from "react-panel-layout";

const config: PanelLayoutConfig = {
  areas: [
    ["cell1", "cell2"],
    ["cell3", "cell4"],
  ],
  rows: [{ size: "1fr" }, { size: "1fr" }],
  columns: [{ size: "1fr" }, { size: "1fr" }],
  gap: "1rem",
};

const layers: LayerDefinition[] = [
  { id: "cell1", component: <Cell1 />, gridArea: "cell1" },
  { id: "cell2", component: <Cell2 />, gridArea: "cell2" },
  { id: "cell3", component: <Cell3 />, gridArea: "cell3" },
  { id: "cell4", component: <Cell4 />, gridArea: "cell4" },
];

<GridLayout config={config} layers={layers} />;
```

### PanelLayoutConfig

Define your grid structure with the following properties:

| Property  | Type           | Description                                   |
|-----------|----------------|-----------------------------------------------|
| `areas`   | `string[][]`   | Grid template areas (CSS grid-template-areas) |
| `rows`    | `GridTrack[]`  | Row track definitions                         |
| `columns` | `GridTrack[]`  | Column track definitions                      |
| `gap`     | `string`       | Gap between grid cells (optional)             |

### GridTrack

Each track (row or column) can be configured with:

```tsx
type GridTrack = {
  size: string;       // CSS size value: "1fr", "200px", "auto", etc.
  resizable?: boolean; // Enable drag-to-resize
  minSize?: number;    // Minimum size in pixels (when resizable)
  maxSize?: number;    // Maximum size in pixels (when resizable)
};
```

### Resizable Tracks

Enable resizable sidebar columns or rows:

```tsx
const config: PanelLayoutConfig = {
  areas: [
    ["sidebar", "main", "inspector"],
  ],
  rows: [{ size: "1fr" }],
  columns: [
    { size: "250px", resizable: true, minSize: 200, maxSize: 400 },
    { size: "1fr" },
    { size: "300px", resizable: true, minSize: 250, maxSize: 500 },
  ],
  gap: "4px",
};
```

### LayerDefinition

Each layer defines content to place in the grid or as a floating overlay:

```tsx
type LayerDefinition = {
  id: string;                    // Unique identifier
  component: React.ReactNode;    // Content to render
  visible?: boolean;             // Show/hide the layer

  // Grid positioning
  gridArea?: string;             // Grid area name from config.areas
  gridRow?: string;              // Explicit grid-row value
  gridColumn?: string;           // Explicit grid-column value

  // Floating positioning (for overlays)
  position?: { top?, right?, bottom?, left? };
  width?: string | number;
  height?: string | number;
  zIndex?: number;

  // Floating behavior
  floating?: {
    draggable?: boolean;
    resizable?: boolean;
    constraints?: { minWidth?, maxWidth?, minHeight?, maxHeight? };
  };

  // Drawer behavior (slide-in panels)
  drawer?: DrawerBehavior;
};
```

### Floating Overlays

Add draggable floating panels on top of the grid:

```tsx
const layers: LayerDefinition[] = [
  // Grid-based layer
  {
    id: "canvas",
    component: <Canvas />,
    gridArea: "canvas",
    zIndex: 0,
  },
  // Floating panel
  {
    id: "tools",
    component: <ToolsPanel />,
    position: { left: 20, top: 20 },
    width: 200,
    height: 250,
    zIndex: 10,
    floating: {
      draggable: true,
    },
  },
];
```

### IDE-Style Layout Example

A complete IDE-style layout with toolbar, sidebar, main canvas, and floating panels:

```tsx
const config: PanelLayoutConfig = {
  areas: [
    ["toolbar", "toolbar", "toolbar"],
    ["sidebar", "canvas", "inspector"],
    ["statusbar", "statusbar", "statusbar"],
  ],
  rows: [
    { size: "60px" },
    { size: "1fr" },
    { size: "30px" },
  ],
  columns: [
    { size: "250px", resizable: true, minSize: 200, maxSize: 400 },
    { size: "1fr" },
    { size: "300px", resizable: true, minSize: 250, maxSize: 500 },
  ],
  gap: "4px",
};

const layers: LayerDefinition[] = [
  { id: "toolbar", component: <Toolbar />, gridArea: "toolbar", zIndex: 10 },
  { id: "sidebar", component: <Sidebar />, gridArea: "sidebar" },
  { id: "canvas", component: <Canvas />, gridArea: "canvas" },
  { id: "inspector", component: <Inspector />, gridArea: "inspector" },
  { id: "statusbar", component: <StatusBar />, gridArea: "statusbar", zIndex: 10 },
  // Floating panel
  {
    id: "preview",
    component: <Preview />,
    position: { right: 20, top: 80 },
    width: 300,
    height: 400,
    zIndex: 20,
    floating: { draggable: true },
  },
];

<GridLayout config={config} layers={layers} />;
```

---

## Pivot – Headless Content Switching

`usePivot` is a headless hook for building tabbed interfaces, content switchers, and navigation patterns. It handles state management and provides an `Outlet` component for rendering content with CSS transitions.

### Quick Start

```tsx
import { usePivot } from "react-panel-layout/pivot";

const items = [
  { id: "home", label: "Home", content: <HomePage /> },
  { id: "settings", label: "Settings", content: <SettingsPage /> },
];

function MyTabs() {
  const { activeId, getItemProps, Outlet } = usePivot({
    items,
    defaultActiveId: "home",
  });

  return (
    <div>
      <nav>
        {items.map((item) => (
          <button key={item.id} {...getItemProps(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
```

### Transition Modes

```tsx
const { Outlet } = usePivot({
  items,
  transitionMode: "css",  // "css" (default) | "none"
});
```

- `"css"` – Smooth opacity transitions via CSS design tokens (default)
- `"none"` – Instant switch, uses React.Activity for memory optimization

### Design Tokens

Customize animations via CSS custom properties:

```css
/* Define enter/leave keyframes */
@keyframes pivotEnter {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pivotLeave {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Reference via design tokens */
:root {
  --rpl-pivot-animation-enter: pivotEnter 150ms ease-out forwards;
  --rpl-pivot-animation-leave: pivotLeave 150ms ease-out forwards;
}
```

Example: Slide-up animation:
```css
@keyframes pivotSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pivotSlideOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-8px); }
}

:root {
  --rpl-pivot-animation-enter: pivotSlideIn 150ms ease-out forwards;
  --rpl-pivot-animation-leave: pivotSlideOut 150ms ease-out forwards;
}
```

### UsePivotOptions

| Property | Type | Description |
|----------|------|-------------|
| `items` | `PivotItem[]` | Array of content items |
| `activeId` | `string` | Controlled active item ID |
| `defaultActiveId` | `string` | Default active item (uncontrolled) |
| `onActiveChange` | `(id) => void` | Callback when active item changes |
| `transitionMode` | `"css" \| "none"` | Enable/disable CSS transitions |

### UsePivotResult

| Property | Type | Description |
|----------|------|-------------|
| `activeId` | `string` | Current active item ID |
| `setActiveId` | `(id) => void` | Change active item |
| `isActive` | `(id) => boolean` | Check if item is active |
| `getItemProps` | `(id) => props` | Get props for navigation elements |
| `Outlet` | `React.FC` | Component that renders active content |
