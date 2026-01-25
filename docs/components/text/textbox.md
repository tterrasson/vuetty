# TextBox

The TextBox component renders styled text with colors, effects, and automatic wrapping. Use it as the primary text component in terminal UIs.

For static multicolor text, see the Gradient component in `docs/components/text/gradient.md`.

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
| `effect` | `string` | - | Apply a text effect (`rainbow`, `pulse`, `wave`, `shimmer`) |
| `effectProps` | `object` | - | Effect-specific options (see effects below) |
| `animated` | `boolean` | `false` | Enable animation for animated effects |
| `animationInterval` | `number` | - | Override the effect's default frame interval (ms) |

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

## Text Effects (Animated)

TextBox supports animated effects via the `effect` prop. When an effect is set, TextBox applies the effect instead of the base text styles (color, bold, italic, underline, dim). Padding and wrapping still apply.

### Basic Usage

```vue
<template>
  <TextBox
    effect="rainbow"
    :animated="true"
    :effectProps="{ speed: 1 }"
  >
    Animated rainbow text
  </TextBox>
</template>

<script setup>
import { TextBox } from 'vuetty';
</script>
```

### Available Effects

#### Rainbow

Animated rainbow gradient that scrolls across the text.

`effectProps`:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `speed` | `number` | `1` | Animation speed multiplier |

```vue
<template>
  <TextBox effect="rainbow" :animated="true" :effectProps="{ speed: 2 }">
    Faster rainbow
  </TextBox>
</template>

<script setup>
import { TextBox } from 'vuetty';
</script>
```

#### Pulse

Smooth brightness pulsing of a single color.

`effectProps`:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | `'white'` | Base color to pulse |
| `minBrightness` | `number` | `0.4` | Minimum brightness (0 to 1) |
| `maxBrightness` | `number` | `1.0` | Maximum brightness (0 to 1) |

```vue
<template>
  <TextBox
    effect="pulse"
    :animated="true"
    :effectProps="{ color: '#00FFFF', minBrightness: 0.3, maxBrightness: 1.0 }"
  >
    Cyan pulse
  </TextBox>
</template>

<script setup>
import { TextBox } from 'vuetty';
</script>
```

#### Wave

Animated color wave flowing across the text.

`effectProps`:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colors` | `string[]` | `['#00FFFF', '#FF00FF']` | Gradient colors |
| `wavelength` | `number` | `10` | Wave length in characters |
| `speed` | `number` | `1` | Animation speed multiplier |

```vue
<template>
  <TextBox
    effect="wave"
    :animated="true"
    :effectProps="{ colors: ['#00FFFF', '#FF00FF'], wavelength: 8, speed: 1 }"
  >
    Color wave
  </TextBox>
</template>

<script setup>
import { TextBox } from 'vuetty';
</script>
```

#### Shimmer

Animated highlight that sweeps across the text.

`effectProps`:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `baseColor` | `string` | `'#666666'` | Base text color |
| `highlightColor` | `string` | `'#FFFFFF'` | Highlight color |
| `width` | `number` | `3` | Highlight width (characters) |
| `speed` | `number` | `1` | Animation speed multiplier |

```vue
<template>
  <TextBox
    effect="shimmer"
    :animated="true"
    :effectProps="{ baseColor: '#444444', highlightColor: '#FFFFFF', width: 5, speed: 1 }"
  >
    Shimmering text
  </TextBox>
</template>

<script setup>
import { TextBox } from 'vuetty';
</script>
```

### Animation Interval

Each animated effect has a default frame interval:

| Effect | Default interval |
|--------|------------------|
| `rainbow` | `100ms` |
| `pulse` | `50ms` |
| `wave` | `80ms` |
| `shimmer` | `60ms` |

Override the interval per instance:

```vue
<template>
  <TextBox
    effect="pulse"
    :animated="true"
    :animationInterval="120"
    :effectProps="{ color: '#FF6B35' }"
  >
    Slower pulse
  </TextBox>
</template>

<script setup>
import { TextBox } from 'vuetty';
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
