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
| `data` | `array` | `[]` | Tree nodes (required) |
| `branchColor` | `string` | `'gray'` | Color for branch characters (the connecting lines) |
| `folderColor` | `string` | `'blue'` | Color for nodes with children |
| `fileColor` | `string` | `null` | Color for leaf nodes (falls back to `color` or theme default) |
| `color` | `string` | `-` | Fallback color used for files when `fileColor` is not set |
| `bg` | `string` | `-` | Reserved for future background styling |
| `showIcons` | `boolean` | `false` | Show folder/file icons before node names |
| `indent` | `number` | `4` | Indentation size per level (currently fixed at 4 spaces) |
| `bold` | `boolean` | `false` | Reserved for future text styling |
| `dim` | `boolean` | `false` | Reserved for future text styling |

### Layout

Tree supports the common layout props for sizing and positioning:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number \| string` | `null` | Fixed width or percentage |
| `height` | `number \| string` | `null` | Fixed height |
| `minWidth` | `number` | `null` | Minimum width |
| `maxWidth` | `number` | `null` | Maximum width |
| `minHeight` | `number` | `null` | Minimum height |
| `maxHeight` | `number` | `null` | Maximum height |
| `padding` | `number` | `null` | Padding around the tree |
| `paddingLeft` | `number` | `null` | Left padding |
| `paddingRight` | `number` | `null` | Right padding |
| `paddingTop` | `number` | `null` | Top padding |
| `paddingBottom` | `number` | `null` | Bottom padding |
| `margin` | `number` | `null` | Margin around the tree |
| `marginLeft` | `number` | `null` | Left margin |
| `marginRight` | `number` | `null` | Right margin |
| `marginTop` | `number` | `null` | Top margin |
| `marginBottom` | `number` | `null` | Bottom margin |
| `flex` | `number \| string` | `null` | Flex grow factor when inside a flex container |
| `flexGrow` | `number` | `null` | Flex grow value |
| `flexShrink` | `number` | `null` | Flex shrink value |
| `flexBasis` | `number \| string` | `null` | Flex basis value |
| `alignSelf` | `string` | `null` | Self alignment: 'flex-start', 'flex-end', 'center', 'stretch', 'baseline' |

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

## Notes

- Tree height is computed from the total number of visible nodes.
- If `width` and `flex` are not set, Tree defaults to full width.
- Theme defaults can be provided via `theme.components.tree.branchColor`, `folderColor`, and `fileColor`.
