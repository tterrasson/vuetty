# CodeDiff

The CodeDiff component renders a syntax-highlighted diff between two code strings. It supports inline (unified) and side-by-side layouts, optional line numbers, and context trimming.

## Basic Usage (Inline)

```vue
<template>
  <CodeDiff
    :old-code="oldCode"
    :new-code="newCode"
    language="js"
  />
</template>

<script setup>
import { CodeDiff } from 'vuetty';

const oldCode = `function sum(a, b) {
  return a + b;
}
`;

const newCode = `function sum(a, b) {
  return a + b + 1;
}
`;
</script>
```

## Side-by-Side Mode

```vue
<template>
  <CodeDiff
    :old-code="oldCode"
    :new-code="newCode"
    mode="side-by-side"
    :width="80"
  />
</template>

<script setup>
import { CodeDiff } from 'vuetty';

const oldCode = `const user = {
  name: 'Sam',
  active: true
};
`;

const newCode = `const user = {
  name: 'Sam',
  active: false
};
`;
</script>
```

## Context and Full Diff

```vue
<template>
  <Col :gap="1">
    <!-- Show 1 line of context around changes -->
    <CodeDiff
      :old-code="oldCode"
      :new-code="newCode"
      :context="1"
    />

    <!-- Show all lines, ignoring context -->
    <CodeDiff
      :old-code="oldCode"
      :new-code="newCode"
      :show-all="true"
      :show-line-numbers="false"
    />
  </Col>
</template>

<script setup>
import { Col, CodeDiff } from 'vuetty';

const oldCode = `line 1
line 2
line 3
line 4
line 5
`;

const newCode = `line 1
line 2
line three
line 4
line 5
`;
</script>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `oldCode` | `string` | `''` | Original code to compare |
| `newCode` | `string` | `''` | Updated code to compare |
| `mode` | `'inline' \| 'side-by-side'` | `'inline'` | Diff layout |
| `language` | `string` | `'text'` | Syntax highlighting language |
| `showLineNumbers` | `boolean` | `true` | Show line numbers |
| `context` | `number` | `3` | Lines of context around changes (`0` shows only changed lines) |
| `showAll` | `boolean` | `false` | Show all lines and ignore `context` |
| `addedColor` | `string` | `null` | Text color for added lines (theme fallback) |
| `removedColor` | `string` | `null` | Text color for removed lines (theme fallback) |
| `unchangedColor` | `string` | `null` | Text color for unchanged lines (theme fallback) |
| `addedBg` | `string` | `null` | Background color for added lines (theme fallback) |
| `removedBg` | `string` | `null` | Background color for removed lines (theme fallback) |
| `lineNumberColor` | `string` | `null` | Line number color (theme fallback) |
| `codeBg` | `string` | `null` | Code background color (theme fallback) |
| `border` | `boolean` | `true` | Render a border around the diff |
| `padding` | `number` | `1` | Inner padding |

## Layout Props (Box Props)

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

## Theming Notes

- Theme overrides can be provided via `theme.components.codeDiff` for colors and border.
- If a color prop is `null`, CodeDiff falls back to theme defaults (for example `theme.success` and `theme.danger`).
