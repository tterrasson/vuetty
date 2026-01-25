# Gradient

The Gradient component applies gradient colors to text and other components. It supports preset gradients, custom color arrays, and interpolation modes.

For animated text effects (rainbow, pulse, wave, shimmer), see the TextBox effects section in `docs/components/text/textbox.md`.

## Basic Usage

```vue
<template>
  <Gradient name="rainbow">
    Rainbow Text
  </Gradient>
</template>

<script setup>
import { Gradient } from 'vuetty';
</script>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | `null` | Preset gradient name |
| `colors` | `Array<string>` | `null` | Custom color array (hex codes) |
| `interpolation` | `string` | `'hsv'` | Interpolation mode: 'rgb' or 'hsv' |

## Preset Gradients

### Rainbow

```vue
<template>
  <Gradient name="rainbow">
    Rainbow Gradient
  </Gradient>
</template>

<script setup>
import { Gradient } from 'vuetty';
</script>
```

### Pastel

```vue
<template>
  <Gradient name="pastel">
    Pastel Gradient
  </Gradient>
</template>

<script setup>
import { Gradient } from 'vuetty';
</script>
```

### Fire

```vue
<template>
  <Gradient name="fire">
    Fire Gradient
  </Gradient>
</template>

<script setup>
import { Gradient } from 'vuetty';
</script>
```

### Ocean

```vue
<template>
  <Gradient name="ocean">
    Ocean Gradient
  </Gradient>
</template>

<script setup>
import { Gradient } from 'vuetty';
</script>
```

### Sunset

```vue
<template>
  <Gradient name="sunset">
    Sunset Gradient
  </Gradient>
</template>

<script setup>
import { Gradient } from 'vuetty';
</script>
```

### Forest

```vue
<template>
  <Gradient name="forest">
    Forest Gradient
  </Gradient>
</template>

<script setup>
import { Gradient } from 'vuetty';
</script>
```

### Night

```vue
<template>
  <Gradient name="night">
    Night Gradient
  </Gradient>
</template>

<script setup>
import { Gradient } from 'vuetty';
</script>
```

## Custom Gradients

### Custom Colors

```vue
<template>
  <Gradient :colors="['#FF0000', '#00FF00', '#0000FF']">
    Custom Gradient
  </Gradient>
</template>

<script setup>
import { Gradient } from 'vuetty';
</script>
```

### Interpolation Modes

#### HSV Interpolation

```vue
<template>
  <Gradient name="rainbow" interpolation="hsv">
    HSV Interpolation
  </Gradient>
</template>

<script setup>
import { Gradient } from 'vuetty';
</script>
```

#### RGB Interpolation

```vue
<template>
  <Gradient name="rainbow" interpolation="rgb">
    RGB Interpolation
  </Gradient>
</template>

<script setup>
import { Gradient } from 'vuetty';
</script>
```

## Usage with Other Components

### With BigText

```vue
<template>
  <Gradient name="rainbow">
    <BigText font="Big">Rainbow BigText</BigText>
  </Gradient>
</template>

<script setup>
import { Gradient, BigText } from 'vuetty';
</script>
```

### With TextBox

```vue
<template>
  <Gradient name="ocean">
    <TextBox>Ocean Gradient Text</TextBox>
  </Gradient>
</template>

<script setup>
import { Gradient, TextBox } from 'vuetty';
</script>
```

### With Box

```vue
<template>
  <Box :padding="1">
    <Gradient name="fire">
      <TextBox>Fire Gradient in Box</TextBox>
    </Gradient>
  </Box>
</template>

<script setup>
import { Gradient, Box, TextBox } from 'vuetty';
</script>
```

## Common Patterns

### Title

```vue
<template>
  <Gradient name="rainbow">
    <BigText font="Slant">Application Title</BigText>
  </Gradient>
</template>

<script setup>
import { Gradient, BigText } from 'vuetty';
</script>
```

### Header

```vue
<template>
  <Gradient name="ocean" interpolation="hsv">
    <TextBox bold>Welcome Header</TextBox>
  </Gradient>
</template>

<script setup>
import { Gradient, TextBox } from 'vuetty';
</script>
```

### Decorative Element

```vue
<template>
  <Gradient name="fire">
    <TextBox>Decorative Element</TextBox>
  </Gradient>
</template>

<script setup>
import { Gradient, TextBox } from 'vuetty';
</script>
```
