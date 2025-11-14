# Design Tokens (CSS Variables)

react-panel-layout uses CSS custom properties (CSS variables) for theming. All design tokens are prefixed with `--rpl-` to avoid conflicts with other libraries.

## Overview

The library provides a comprehensive set of CSS variables that control the appearance of panels, tabs, and interactive elements. You can customize these variables in your own stylesheet to match your application's design.

**No JavaScript configuration needed** - all theming is done purely through CSS.

## CSS Variables Reference

### Colors

#### Tab Colors

| Variable | Default | Description |
|----------|---------|-------------|
| `--rpl-color-tab-fg` | `#d5d7de` | Tab text color |
| `--rpl-color-tab-active-bg` | `#2b2d35` | Active tab background |
| `--rpl-color-tabbar-bg` | `#1e1f24` | Tab bar background |

#### Panel Colors

| Variable | Default | Description |
|----------|---------|-------------|
| `--rpl-color-panel-border` | `rgba(0, 0, 0, 0.3)` | Panel border color |
| `--rpl-color-panel-bg` | `#0b0b0c` | Panel content background |
| `--rpl-color-primary` | `#2196f3` | Primary accent color (resize handles) |

#### Resize Handle Colors

| Variable | Default | Description |
|----------|---------|-------------|
| `--rpl-color-resize-handle-hover` | `rgba(33, 150, 243, 0.35)` | Divider color when hovered |
| `--rpl-color-resize-handle-active` | `rgba(33, 150, 243, 0.55)` | Divider color while dragging |

#### Drag & Drop Colors

| Variable | Default | Description |
|----------|---------|-------------|
| `--rpl-color-drop-suggest-border` | `rgba(90, 150, 255, 0.9)` | Drop zone border color |
| `--rpl-color-drop-suggest-bg` | `rgba(90, 150, 255, 0.15)` | Drop zone background |
| `--rpl-color-tabdrag-bg` | `rgba(34, 36, 42, 0.95)` | Dragged tab background |
| `--rpl-color-tabdrag-fg` | `#e9ebf0` | Dragged tab text color |
| `--rpl-color-tabdrag-border` | `rgba(120, 160, 255, 0.6)` | Dragged tab border |
| `--rpl-color-tabdrag-shadow` | `0 6px 20px rgba(0, 0, 0, 0.35)` | Dragged tab shadow |
| `--rpl-color-insert-guide` | `rgba(120, 160, 255, 0.95)` | Tab insert guide color |
| `--rpl-color-insert-guide-shadow` | `0 0 0 2px rgba(120, 160, 255, 0.2)` | Insert guide shadow |

### Sizing & Spacing

#### Tab Sizing

| Variable | Default | Description |
|----------|---------|-------------|
| `--rpl-size-tab-font` | `12px` | Tab font size |
| `--rpl-space-tab-padding-y` | `4px` | Tab vertical padding |
| `--rpl-space-tab-padding-x` | `8px` | Tab horizontal padding |

#### Tab Bar Spacing

| Variable | Default | Description |
|----------|---------|-------------|
| `--rpl-space-tabbar-gap` | `6px` | Gap between tabs |
| `--rpl-space-tabbar-padding-y` | `4px` | Tab bar vertical padding |
| `--rpl-space-tabbar-padding-x` | `6px` | Tab bar horizontal padding |

#### Border Radius

| Variable | Default | Description |
|----------|---------|-------------|
| `--rpl-radius-tab` | `4px` | Tab corner radius |
| `--rpl-radius-suggest` | `6px` | Drop suggestion corner radius |

#### Border Widths

| Variable | Default | Description |
|----------|---------|-------------|
| `--rpl-size-suggest-border` | `2px` | Drop suggestion border width |

#### Handle Thicknesses

| Variable | Default | Description |
|----------|---------|-------------|
| `--rpl-size-grid-handle-thickness` | `4px` | Grid track resize handle thickness |
| `--rpl-size-resize-handle-thickness` | `4px` | Component resize handle thickness |
| `--rpl-size-split-handle-thickness` | `6px` | Panel split handle thickness |

#### Padding

| Variable | Default | Description |
|----------|---------|-------------|
| `--rpl-space-drop-suggest-padding` | `6px` | Padding inside drop suggestion zone |

### Z-Index

| Variable | Default | Description |
|----------|---------|-------------|
| `--rpl-z-overlay` | `9998` | Drop suggestion overlay z-index |
| `--rpl-z-tabdrag-overlay` | `9999` | Tab drag overlay z-index |

## Usage

### Basic Import

```tsx
import 'react-panel-layout/style.css'
```

The CSS variables are automatically applied when you import the stylesheet.

### Customizing Theme

Override CSS variables in your own stylesheet:

```css
/* Override specific variables */
:root {
  --rpl-color-primary: #ff6b6b;
  --rpl-color-tab-active-bg: #3a3f4b;
  --rpl-radius-tab: 8px;
}
```

### Scoped Theming

Apply different themes to different parts of your app:

```css
/* Dark theme (default) */
.dark-theme {
  --rpl-color-tabbar-bg: #1e1f24;
  --rpl-color-panel-bg: #0b0b0c;
  --rpl-color-panel-border: rgba(0, 0, 0, 0.3);
}

/* Light theme */
.light-theme {
  --rpl-color-tabbar-bg: #f5f5f5;
  --rpl-color-panel-bg: #ffffff;
  --rpl-color-panel-border: rgba(0, 0, 0, 0.1);
  --rpl-color-tab-fg: #1a1a1a;
  --rpl-color-tab-active-bg: #e0e0e0;
}
```

```tsx
<div className="light-theme">
  <PanelSystem {...props} />
</div>
```

## Examples

### Example 1: Brand Colors

```css
:root {
  /* Use your brand primary color */
  --rpl-color-primary: #7c3aed;
  --rpl-color-tab-active-bg: #6d28d9;

  /* Matching drop suggestions */
  --rpl-color-drop-suggest-border: rgba(124, 58, 237, 0.9);
  --rpl-color-drop-suggest-bg: rgba(124, 58, 237, 0.15);
}
```

### Example 2: Larger UI

```css
:root {
  /* Increase font size and spacing */
  --rpl-size-tab-font: 14px;
  --rpl-space-tab-padding-y: 6px;
  --rpl-space-tab-padding-x: 12px;
  --rpl-space-tabbar-gap: 8px;

  /* Thicker handles for easier grabbing */
  --rpl-size-split-handle-thickness: 8px;
  --rpl-size-resize-handle-thickness: 6px;
}
```

### Example 3: Minimal Style

```css
:root {
  /* Remove rounded corners */
  --rpl-radius-tab: 0;
  --rpl-radius-suggest: 0;

  /* Minimal spacing */
  --rpl-space-tab-padding-y: 2px;
  --rpl-space-tab-padding-x: 6px;
  --rpl-space-tabbar-gap: 2px;

  /* Subtle colors */
  --rpl-color-panel-border: rgba(0, 0, 0, 0.1);
  --rpl-color-primary: #666;
}
```

### Example 4: High Contrast

```css
:root {
  /* High contrast colors */
  --rpl-color-tab-fg: #ffffff;
  --rpl-color-tab-active-bg: #000000;
  --rpl-color-tabbar-bg: #1a1a1a;
  --rpl-color-panel-bg: #000000;
  --rpl-color-panel-border: #ffffff;
  --rpl-color-primary: #00ff00;

  /* Thicker borders for visibility */
  --rpl-size-suggest-border: 3px;
}
```

### Example 5: VS Code Theme

```css
:root {
  /* VS Code Dark+ colors */
  --rpl-color-tabbar-bg: #2d2d30;
  --rpl-color-tab-fg: #cccccc;
  --rpl-color-tab-active-bg: #1e1e1e;
  --rpl-color-panel-bg: #1e1e1e;
  --rpl-color-panel-border: #3e3e42;
  --rpl-color-primary: #007acc;

  /* VS Code tab styling */
  --rpl-size-tab-font: 13px;
  --rpl-space-tab-padding-y: 8px;
  --rpl-space-tab-padding-x: 10px;
  --rpl-radius-tab: 0;
}
```

## Best Practices

### 1. Use CSS Custom Properties for Dynamic Themes

```css
/* Define theme tokens */
.app {
  --brand-primary: #3b82f6;
  --surface-1: #1f2937;
  --surface-2: #111827;
}

/* Map to panel tokens */
:root {
  --rpl-color-primary: var(--brand-primary);
  --rpl-color-tabbar-bg: var(--surface-1);
  --rpl-color-panel-bg: var(--surface-2);
}
```

### 2. Respect User Preferences

```css
@media (prefers-color-scheme: light) {
  :root {
    --rpl-color-tabbar-bg: #f5f5f5;
    --rpl-color-panel-bg: #ffffff;
    --rpl-color-tab-fg: #1a1a1a;
    /* ... other light theme colors */
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --rpl-color-tabbar-bg: #1e1f24;
    --rpl-color-panel-bg: #0b0b0c;
    --rpl-color-tab-fg: #d5d7de;
    /* ... other dark theme colors */
  }
}
```

### 3. Layer Your Customizations

```css
/* Base layer - application defaults */
:root {
  --rpl-color-primary: #3b82f6;
}

/* Component layer - specific component overrides */
.editor-panels {
  --rpl-color-panel-bg: #1a1a1a;
  --rpl-size-tab-font: 11px;
}

/* State layer - interactive states */
.editor-panels[data-focus="true"] {
  --rpl-color-panel-border: var(--rpl-color-primary);
}
```

## Troubleshooting

### Theme Not Applying

Make sure you're importing the CSS:

```tsx
import 'react-panel-layout/style.css'
```

### Variables Not Working

Check that your CSS variables are defined before the component mounts:

```html
<!-- ❌ Wrong - overrides loaded after component -->
<PanelSystem />
<link rel="stylesheet" href="custom-theme.css">

<!-- ✅ Correct - overrides loaded before component -->
<link rel="stylesheet" href="custom-theme.css">
<PanelSystem />
```

### Specificity Issues

If variables aren't applying, check CSS specificity:

```css
/* ❌ May not work if overridden */
.my-theme {
  --rpl-color-primary: red;
}

/* ✅ Higher specificity */
.app .my-theme {
  --rpl-color-primary: red;
}

/* ✅ Or use :root for global */
:root {
  --rpl-color-primary: red;
}
```

## Migration from v0.0.x

Previous versions used a `themeTokens` prop on `PanelThemeProvider`. This has been removed in favor of CSS variables.

**Before:**
```tsx
<PanelThemeProvider tokens={{
  colorPrimary: '#ff6b6b',
  splitHandleThickness: 8
}}>
  <PanelSystem {...props} />
</PanelThemeProvider>
```

**After:**
```css
:root {
  --rpl-color-primary: #ff6b6b;
  --rpl-size-split-handle-thickness: 8px;
}
```

```tsx
<PanelSystem {...props} />
```

Benefits:
- ✅ No extra provider needed
- ✅ Better performance (no React re-renders for theme changes)
- ✅ Standard CSS - works with any CSS preprocessor
- ✅ Easier to override with media queries
- ✅ Smaller bundle size
