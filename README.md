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
