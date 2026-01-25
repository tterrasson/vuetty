# Image

The Image component displays images in terminal applications using ANSI block rendering. It supports loading images from files or buffers, resizing, and error handling.

## Basic Usage

```vue
<template>
  <Image src="/path/to/image.png" />
</template>

<script setup>
import { Image } from 'vuetty';
</script>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string \| object` | required | Source of the image (file path or buffer) |
| `width` | `number \| string` | `null` | Width of the image in columns or percentage |
| `height` | `number \| string` | `null` | Height of the image in rows |
| `preserveAspectRatio` | `boolean` | `true` | Preserve the aspect ratio when resizing |
| `alt` | `string` | `''` | Alternative text for the image |
| `errorColor` | `string` | `'red'` | Color for error messages |
| `errorBorderStyle` | `string` | `'rounded'` | Border style for error display |

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

### Fixed Width

```vue
<template>
  <Image src="/path/to/image.png" :width="40" />
</template>

<script setup>
import { Image } from 'vuetty';
</script>
```

### Percentage Width

```vue
<template>
  <Image src="/path/to/image.png" width="50%" />
</template>

<script setup>
import { Image } from 'vuetty';
</script>
```

### Fixed Height

```vue
<template>
  <Image src="/path/to/image.png" :height="10" />
</template>

<script setup>
import { Image } from 'vuetty';
</script>
```

### Disable Aspect Ratio Preservation

```vue
<template>
  <Image src="/path/to/image.png" :preserveAspectRatio="false" />
</template>

<script setup>
import { Image } from 'vuetty';
</script>
```

## Error Handling

### Custom Error Message

```vue
<template>
  <Image
    src="/path/to/image.png"
    errorColor="yellow"
    errorBorderStyle="double"
  />
</template>

<script setup>
import { Image } from 'vuetty';
</script>
```

### Alternative Text

```vue
<template>
  <Image
    src="/path/to/image.png"
    alt="Description of the image"
  />
</template>

<script setup>
import { Image } from 'vuetty';
</script>
```

## Usage with Other Components

### With Box

```vue
<template>
  <Box :padding="1" border>
    <Image src="/path/to/image.png" />
  </Box>
</template>

<script setup>
import { Image, Box } from 'vuetty';
</script>
```

### With Row and Col

```vue
<template>
  <Row gap="2">
    <Col flex="1">
      <Image src="/path/to/image1.png" />
    </Col>
    <Col flex="1">
      <Image src="/path/to/image2.png" />
    </Col>
  </Row>
</template>

<script setup>
import { Image, Row, Col } from 'vuetty';
</script>
```

## Advanced Usage

### Loading Images from Buffers

```vue
<template>
  <Image :src="imageBuffer" />
</template>

<script setup>
import { ref } from 'vue';
import { Image } from 'vuetty';

const imageBuffer = ref(Buffer.from(...));
</script>
```

### Dynamic Image Source

```vue
<template>
  <Image :src="dynamicImagePath" />
</template>

<script setup>
import { ref } from 'vue';
import { Image } from 'vuetty';

const dynamicImagePath = ref('/path/to/image.png');
</script>
```
