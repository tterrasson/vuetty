# BigText

The BigText component renders text as large ASCII art using figlet fonts. It supports custom fonts, alignment, and styling options.

## Basic Usage

```vue
<template>
  <BigText font="Slant">Hello World</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

<!-- Image placeholder: /images/components/bigtext-basic.png - Basic BigText -->
*Simple BigText with Slant font*

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `font` | `string` | `'Standard'` | Font name for ASCII art |
| `horizontalLayout` | `string` | `'default'` | Layout mode: 'default', 'full', or 'fitted' |
| `align` | `string` | `'left'` | Text alignment: 'left', 'center', or 'right' |
| `color` | `string` | `-` | Text color (chalk color names) |
| `bg` | `string` | `-` | Background color |
| `bold` | `boolean` | `false` | Bold text |
| `italic` | `boolean` | `false` | Italic text |
| `underline` | `boolean` | `false` | Underlined text |
| `dim` | `boolean` | `false` | Dimmed text |

## Fonts

### Standard Font

```vue
<template>
  <BigText font="Standard">Standard</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

### Slant Font

```vue
<template>
  <BigText font="Slant">Slant</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

### Big Font

```vue
<template>
  <BigText font="Big">Big</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

## Layout Modes

### Default Layout

```vue
<template>
  <BigText horizontalLayout="default">Default</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

### Full Layout

```vue
<template>
  <BigText horizontalLayout="full">Full</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

### Fitted Layout

```vue
<template>
  <BigText horizontalLayout="fitted">Fitted</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

## Alignment

### Left Alignment

```vue
<template>
  <BigText align="left">Left</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

### Center Alignment

```vue
<template>
  <BigText align="center">Center</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

### Right Alignment

```vue
<template>
  <BigText align="right">Right</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

## Styling

### Custom Colors

```vue
<template>
  <BigText color="cyan">Cyan</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

### Background Colors

```vue
<template>
  <BigText bg="blue" color="white">Blue Background</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

### Text Styling

```vue
<template>
  <BigText bold>Bold</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

## Usage with Other Components

### With Gradient

```vue
<template>
  <Gradient name="rainbow">
    <BigText font="Big">Rainbow</BigText>
  </Gradient>
</template>

<script setup>
import { BigText, Gradient } from 'vuetty';
</script>
```

### With Box

```vue
<template>
  <Box :padding="2" color="magenta" borderStyle="double">
    <BigText font="Slant">VUETTY</BigText>
  </Box>
</template>

<script setup>
import { BigText, Box } from 'vuetty';
</script>
```

## Common Patterns

### Title

```vue
<template>
  <BigText font="Slant" color="cyan">Application Title</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

### Header

```vue
<template>
  <BigText font="Big" align="center">Welcome</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```

### Decorative Element

```vue
<template>
  <BigText font="Standard" color="green" bold>Success!</BigText>
</template>

<script setup>
import { BigText } from 'vuetty';
</script>
```