# TextBox

The TextBox component renders styled text content with support for colors, text effects, and automatic wrapping. It's the primary component for displaying text in terminal UIs.

## Basic Usage

```vue
<template>
  <TextBox>Hello, World!</TextBox>
</template>

<script setup>
import { TextBox } from 'vuetty';
</script>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | - | Text color: 'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray' |
| `bg` | `string` | - | Background color (same options as color) |
| `bold` | `boolean` | `false` | Make text bold/bright |
| `italic` | `boolean` | `false` | Make text italic |
| `underline` | `boolean` | `false` | Underline text |
| `dim` | `boolean` | `false` | Make text dimmer |
| `width` | `number` | - | Force specific width (enables wrapping) |

## Text Colors

Apply color to text:

```vue
<template>
  <Col gap="1">
    <TextBox color="red">Red text</TextBox>
    <TextBox color="green">Green text</TextBox>
    <TextBox color="blue">Blue text</TextBox>
    <TextBox color="yellow">Yellow text</TextBox>
    <TextBox color="magenta">Magenta text</TextBox>
    <TextBox color="cyan">Cyan text</TextBox>
    <TextBox color="white">White text</TextBox>
    <TextBox color="gray">Gray text</TextBox>
  </Col>
</template>

<script setup>
import { Col, TextBox } from 'vuetty';
</script>
```

## Background Colors

Apply background color:

```vue
<template>
  <Col gap="1">
    <TextBox bg="red" color="white">Red background</TextBox>
    <TextBox bg="green" color="black">Green background</TextBox>
    <TextBox bg="blue" color="white">Blue background</TextBox>
    <TextBox bg="cyan" color="black">Cyan background</TextBox>
  </Col>
</template>

<script setup>
import { Col, TextBox } from 'vuetty';
</script>
```

## Text Effects

### Bold

```vue
<template>
  <Col gap="1">
    <TextBox bold>Bold text</TextBox>
    <TextBox bold color="cyan">Bold cyan</TextBox>
  </Col>
</template>

<script setup>
import { Col, TextBox } from 'vuetty';
</script>
```

### Italic

```vue
<template>
  <Col gap="1">
    <TextBox italic>Italic text</TextBox>
    <TextBox italic color="green">Italic green</TextBox>
  </Col>
</template>

<script setup>
import { Col, TextBox } from 'vuetty';
</script>
```

### Underline

```vue
<template>
  <Col gap="1">
    <TextBox underline>Underlined text</TextBox>
    <TextBox underline color="blue">Underlined blue</TextBox>
  </Col>
</template>

<script setup>
import { Col, TextBox } from 'vuetty';
</script>
```

### Dim

```vue
<template>
  <Col gap="1">
    <TextBox dim>Dim text</TextBox>
    <TextBox dim color="cyan">Dim cyan</TextBox>
  </Col>
</template>

<script setup>
import { Col, TextBox } from 'vuetty';
</script>
```

## Combined Effects

Mix multiple effects together:

```vue
<template>
  <Col gap="1">
    <TextBox bold color="cyan">Bright cyan</TextBox>
    <TextBox bold italic color="green">Bold italic green</TextBox>
    <TextBox bold underline color="yellow">Bold underlined yellow</TextBox>
    <TextBox bold color="white" bg="red">Bold white on red</TextBox>
    <TextBox dim color="gray">Dim gray</TextBox>
  </Col>
</template>

<script setup>
import { Col, TextBox } from 'vuetty';
</script>
```

## Text Wrapping

TextBox automatically wraps text to fit the available width when used inside a container:

```vue
<template>
  <Box border padding="1" width="40">
    <TextBox>
      This is a long text that will automatically wrap to fit within the box width. The TextBox component handles word wrapping intelligently.
    </TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

### Force Specific Width

```vue
<template>
  <TextBox width="30">
    This text will wrap at exactly 30 characters width regardless of container.
  </TextBox>
</template>

<script setup>
import { TextBox } from 'vuetty';
</script>
```

## Common Patterns

### Label and Value

```vue
<template>
  <Row gap="2">
    <TextBox bold color="cyan">Status:</TextBox>
    <TextBox color="green">Active</TextBox>
  </Row>
</template>

<script setup>
import { Row, TextBox } from 'vuetty';
</script>
```

### Section Header

```vue
<template>
  <Col gap="1">
    <TextBox bold underline color="cyan">User Information</TextBox>
    <TextBox>Name: John Doe</TextBox>
    <TextBox>Email: john@example.com</TextBox>
  </Col>
</template>

<script setup>
import { Col, TextBox } from 'vuetty';
</script>
```

### Status Indicator

```vue
<template>
  <Row gap="1">
    <TextBox color="green" bold>✓</TextBox>
    <TextBox>Process completed successfully</TextBox>
  </Row>
</template>

<script setup>
import { Row, TextBox } from 'vuetty';
</script>
```

### Highlighted Info

```vue
<template>
  <Col gap="1">
    <TextBox bg="yellow" color="black" bold>Warning</TextBox>
    <TextBox>This action cannot be undone.</TextBox>
  </Col>
</template>

<script setup>
import { Col, TextBox } from 'vuetty';
</script>
```

## Responsive Text

TextBox responds to terminal width changes automatically:

```vue
<template>
  <Box border width="80" padding="1">
    <TextBox>
      This text will reflow when the terminal is resized. The TextBox component updates automatically to fit the new dimensions.
    </TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```