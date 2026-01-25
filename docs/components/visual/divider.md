# Divider

The Divider component adds a horizontal line to visually separate content in terminal applications. It supports customization of the character used, length, and styling.

## Basic Usage

```vue
<template>
  <Divider />
</template>

<script setup>
import { Divider } from 'vuetty';
</script>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `char` | `string` | `'─'` | Character used to draw the divider |
| `length` | `number` | `40` | Length of the divider in characters |
| `color` | `string` | `-` | Text color ([chalk color names](https://github.com/chalk/chalk?tab=readme-ov-file#styles)) |

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

## Customization

### Custom Character

```vue
<template>
  <Divider char="=" />
</template>

<script setup>
import { Divider } from 'vuetty';
</script>
```

### Custom Length

```vue
<template>
  <Divider :length="20" />
</template>

<script setup>
import { Divider } from 'vuetty';
</script>
```

### Custom Color

```vue
<template>
  <Divider color="cyan" />
</template>

<script setup>
import { Divider } from 'vuetty';
</script>
```

## Usage with Other Components

### With Box

```vue
<template>
  <Box :padding="1">
    <Text>Section 1</Text>
    <Divider />
    <Text>Section 2</Text>
  </Box>
</template>

<script setup>
import { Divider, Box, Text } from 'vuetty';
</script>
```

### With Row and Col

```vue
<template>
  <Col gap="1">
    <Text>Above Divider</Text>
    <Divider />
    <Text>Below Divider</Text>
  </Col>
</template>

<script setup>
import { Divider, Col, Text } from 'vuetty';
</script>
```
