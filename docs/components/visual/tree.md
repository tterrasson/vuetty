# Tree

The Tree component renders hierarchical data structures as a text-based tree with optional icons and per-node styling.

## Basic Usage

```vue
<template>
  <Tree :data="nodes" />
</template>

<script setup>
import { Tree } from 'vuetty';

const nodes = [
  {
    name: 'src',
    children: [
      { name: 'components', children: [{ name: 'Tree.js' }] },
      { name: 'App.vue' }
    ]
  },
  { name: 'package.json' }
];
</script>
```

## Data Structure

Tree expects an array of nodes. Each node can include a `name`, optional `children`, and an optional `color` override.

```js
[
  {
    name: 'root',
    children: [
      { name: 'child-1' },
      {
        name: 'child-2',
        color: 'cyan',
        children: [{ name: 'grandchild' }]
      }
    ]
  }
]
```

## Props

### Tree

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `array` | `[]` | Tree nodes |
| `branchColor` | `string` | `'gray'` | Color for branch characters (the connecting lines) |
| `folderColor` | `string` | `'blue'` | Color for nodes with children |
| `fileColor` | `string` | `null` | Color for leaf nodes (falls back to `color` or theme default) |
| `color` | `string` | `-` | Fallback color used for files when `fileColor` is not set |
| `bg` | `string` | `-` | Reserved for future background styling |
| `showIcons` | `boolean` | `false` | Show folder/file icons before node names |
| `treeStyle` | `string \| object` | `'default'` | Tree branch character style (see Tree Styles below) |

### Layout Props (Box Props)

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `flex` | `number \| string` | `null` | Flex shorthand when inside a flex container |
| `flexGrow` | `number` | `null` | Flex grow factor |
| `flexShrink` | `number` | `null` | Flex shrink factor |
| `flexBasis` | `number \| string` | `null` | Flex basis |
| `alignSelf` | `string` | `null` | Self alignment: 'auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline' |
| `width` | `number \| string` | `null` | Width (chars or %) |
| `height` | `number \| string` | `null` | Height (rows) |
| `minWidth` | `number` | `null` | Minimum width |
| `maxWidth` | `number` | `null` | Maximum width |
| `minHeight` | `number` | `null` | Minimum height |
| `maxHeight` | `number` | `null` | Maximum height |
| `padding` | `number` | `null` | Padding |
| `paddingLeft` | `number` | `null` | Left padding |
| `paddingRight` | `number` | `null` | Right padding |
| `paddingTop` | `number` | `null` | Top padding |
| `paddingBottom` | `number` | `null` | Bottom padding |
| `margin` | `number` | `null` | Margin |
| `marginLeft` | `number` | `null` | Left margin |
| `marginRight` | `number` | `null` | Right margin |
| `marginTop` | `number` | `null` | Top margin |
| `marginBottom` | `number` | `null` | Bottom margin |

## Tree Styles

The `treeStyle` prop controls the appearance of tree branch characters. You can use predefined styles or create custom ones.

### Predefined Styles

| Style | Characters | Description |
|-------|------------|-------------|
| `'default'` or `'rounded'` | `├ └ │ ──` | Standard rounded box-drawing characters |
| `'bold'` | `┣ ┗ ┃ ━━` | Bold/thick box-drawing characters |
| `'double'` | `╠ ╚ ║ ══` | Double-line box-drawing characters |
| `'classic'` | `+ + \| --` | Simple ASCII characters for maximum compatibility |

### Custom Styles

You can provide a custom object with the following properties:

```js
{
  branch: '├',      // Character for intermediate children
  last: '└',        // Character for the last child
  vertical: '│',    // Vertical continuation line
  horizontal: '──'  // Horizontal connecting line
}
```

## Styling Examples

### Custom Branch and Node Colors

```vue
<template>
  <Tree
    :data="nodes"
    branch-color="gray"
    folder-color="cyan"
    file-color="green"
  />
</template>

<script setup>
import { Tree } from 'vuetty';

const nodes = [
  {
    name: 'docs',
    children: [
      { name: 'index.md' },
      { name: 'guide.md' }
    ]
  },
  { name: 'package.json' }
];
</script>
```

### Per-Node Color Overrides

```vue
<template>
  <Tree :data="nodes" />
</template>

<script setup>
import { Tree } from 'vuetty';

const nodes = [
  {
    name: 'src',
    children: [
      { name: 'index.js', color: 'yellow' },
      { name: 'theme.css', color: 'magenta' }
    ]
  }
];
</script>
```

### Icons

```vue
<template>
  <Tree :data="nodes" show-icons />
</template>

<script setup>
import { Tree } from 'vuetty';

const nodes = [
  {
    name: 'assets',
    children: [
      { name: 'logo.svg' },
      { name: 'banner.png' }
    ]
  }
];
</script>
```

### Different Tree Styles

```vue
<template>
  <Col :gap="2">
    <!-- Default/Rounded style -->
    <Tree :data="nodes" treeStyle="default" />

    <!-- Bold style -->
    <Tree :data="nodes" treeStyle="bold" branch-color="cyan" />

    <!-- Double style -->
    <Tree :data="nodes" treeStyle="double" branch-color="magenta" />

    <!-- Classic ASCII style -->
    <Tree :data="nodes" treeStyle="classic" branch-color="yellow" />
  </Col>
</template>

<script setup>
import { Col, Tree } from 'vuetty';

const nodes = [
  {
    name: 'project',
    children: [
      { name: 'src', children: [{ name: 'app.js' }] },
      { name: 'README.md' }
    ]
  }
];
</script>
```

### Custom Tree Style

```vue
<template>
  <Tree :data="nodes" :treeStyle="customStyle" branch-color="green" />
</template>

<script setup>
import { Tree } from 'vuetty';

const nodes = [
  {
    name: 'docs',
    children: [
      { name: 'api', children: [{ name: 'index.md' }] },
      { name: 'guide.md' }
    ]
  }
];

// Define custom tree characters
const customStyle = {
  branch: '▸',
  last: '▹',
  vertical: '┊',
  horizontal: '─'
};
</script>
```

## Notes

- Tree height is computed from the total number of visible nodes.
- If `width` and `flex` are not set, Tree defaults to full width.
- Theme defaults can be provided via `theme.components.tree.branchColor`, `folderColor`, `fileColor`, and `treeStyle`.
