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

<!-- Image placeholder: /images/components/divider-basic.png - Basic Divider -->
*A simple horizontal divider*

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `char` | `string` | `'─'` | Character used to draw the divider |
| `length` | `number` | `40` | Length of the divider in characters |
| `color` | `string` | `-` | Text color ([chalk color names](https://github.com/chalk/chalk?tab=readme-ov-file#styles)) |

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