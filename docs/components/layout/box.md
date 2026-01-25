# Box

The Box component is a visual container that provides borders, padding, titles, and color styling. Use it as a base container in most layouts.

## Basic Usage

```vue
<template>
  <Box :padding="1">
    <TextBox>Content inside a box</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `border` | `boolean` | `true` | Show border around the box |
| `borderStyle` | `string \| object` | `'rounded'` | Border style: 'rounded', 'square', 'double', 'classic', 'bold', 'dashed', 'sparse', 'light' or custom object |
| `title` | `string` | `null` | Title text displayed in the top border |
| `titleAlign` | `string` | `'left'` | Title alignment: 'left', 'center', 'right' |
| `titlePadding` | `number` | `1` | Padding around the title text |
| `color` | `string` | - | Text and border color (chalk color names) |
| `bg` | `string` | - | Background color |
| `bold` | `boolean` | `false` | Bold text |
| `italic` | `boolean` | `false` | Italic text |
| `underline` | `boolean` | `false` | Underlined text |
| `dim` | `boolean` | `false` | Dimmed text |
| `padding` | `number` | `0` | Interior padding (spaces from border to content) |

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
| `padding` | `number` | `0` | Padding |
| `paddingLeft` | `number` | `null` | Left padding |
| `paddingRight` | `number` | `null` | Right padding |
| `paddingTop` | `number` | `null` | Top padding |
| `paddingBottom` | `number` | `null` | Bottom padding |
| `margin` | `number` | `null` | Margin |
| `marginLeft` | `number` | `null` | Left margin |
| `marginRight` | `number` | `null` | Right margin |
| `marginTop` | `number` | `null` | Top margin |
| `marginBottom` | `number` | `null` | Bottom margin |

## Border Styles

Box supports 6 built-in border styles:

```vue
<template>
  <Box borderStyle="rounded" :padding="1">
    <TextBox>Rounded corners</TextBox>
  </Box>
  <Box borderStyle="square" :padding="1">
    <TextBox>Sharp corners</TextBox>
  </Box>
  <Box borderStyle="double" :padding="1">
    <TextBox>Double-line border</TextBox>
  </Box>
  <Box borderStyle="classic" :padding="1">
    <TextBox>Classic border</TextBox>
  </Box>
  <Box borderStyle="bold" :padding="1">
    <TextBox>Bold border lines</TextBox>
  </Box>
  <Box borderStyle="dashed" :padding="1">
    <TextBox>Dashed border</TextBox>
  </Box>
  <Box :padding="1" :border="false">
    <TextBox>Box without border</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

### Custom Border

Define your own border characters:

```vue
<template>
  <Box
    :borderStyle="{
      topLeft: '╔',
      topRight: '╗',
      bottomLeft: '╚',
      bottomRight: '╝',
      horizontal: '═',
      vertical: '║'
    }"
    :padding="1"
  >
    <TextBox>Custom border characters</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

## Title Positioning

Add a title to the top border:

```vue
<template>
  <Box title="Dashboard" titleAlign="left" :padding="1">
    <TextBox>Content here</TextBox>
  </Box>
  <Box title="Welcome" titleAlign="center" :padding="1">
    <TextBox>Centered title</TextBox>
  </Box>
  <Box title="Settings" titleAlign="right" :padding="1">
    <TextBox>Right-aligned title</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

## Colors and Styling

### Colored Borders

```vue
<template>
  <Box :padding="1" color="cyan">
    <TextBox>Cyan border and text</TextBox>
  </Box>

  <Box :padding="1" color="green">
    <TextBox>Green border and text</TextBox>
  </Box>

  <Box :padding="1" color="magenta">
    <TextBox>Magenta border and text</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

### Background Colors

```vue
<template>
  <Box :padding="1" bg="blue" color="white">
    <TextBox>White text on blue background</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

### Text Styling

```vue
<template>
  <Box :padding="1" color="yellow" bold>
    <TextBox>Bold yellow text</TextBox>
  </Box>

  <Box :padding="1" color="gray" dim>
    <TextBox>Dimmed gray text</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

## Text Alignment

Control how text is aligned within the box:

```vue
<template>
  <Box :padding="1" :width="40" align="left">
    <TextBox>Left aligned (default)</TextBox>
  </Box>

  <Box :padding="1" :width="40" align="center">
    <TextBox>Center aligned</TextBox>
  </Box>

  <Box :padding="1" :width="40" align="right">
    <TextBox>Right aligned</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

## Width Control

### Auto Width (Default)

Box automatically sizes to fit content:

```vue
<template>
  <Box :padding="1">
    <TextBox>Fits content</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

### Fixed Width

Set an explicit width:

```vue
<template>
  <Box :padding="1" :width="40">
    <TextBox>This box is exactly 40 characters wide</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

### Full Terminal Width

Use within a Row to fill available space:

```vue
<template>
  <Row>
    <Col>
      <Box :padding="1">
        <TextBox>Fills terminal width</TextBox>
      </Box>
    </Col>
  </Row>
</template>

<script setup>
import { Row, Col, Box, TextBox } from 'vuetty';
</script>
```

## Nesting Boxes

Boxes can be nested for complex layouts:

```vue
<template>
  <Box borderStyle="double" :padding="1" color="cyan">
    <TextBox bold>Outer Box</TextBox>

    <Box borderStyle="rounded" :padding="1" color="green">
      <TextBox>Inner Box 1</TextBox>
    </Box>

    <Box borderStyle="rounded" :padding="1" color="blue">
      <TextBox>Inner Box 2</TextBox>
    </Box>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

## Common Patterns

### Header Box

```vue
<template>
  <Box :padding="1" color="cyan" borderStyle="double">
    <TextBox bold>Application Title</TextBox>
    <TextBox dim>v1.0.0</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

### Error Box

```vue
<template>
  <Box :padding="1" color="red" borderStyle="bold">
    <TextBox bold>Error!</TextBox>
    <TextBox>Something went wrong.</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

### Info Card

```vue
<template>
  <Box
    title="Information"
    titleAlign="center"
    :padding="1"
    color="blue"
  >
    <TextBox>Important information goes here</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

### Content Sections

```vue
<template>
  <Col gap="1">
    <Box title="Section 1" :padding="1" color="green">
      <TextBox>First section content</TextBox>
    </Box>

    <Box title="Section 2" :padding="1" color="blue">
      <TextBox>Second section content</TextBox>
    </Box>

    <Box title="Section 3" :padding="1" color="magenta">
      <TextBox>Third section content</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { Col, Box, TextBox } from 'vuetty';
</script>
```

## Usage with Other Components

### With TextBox

```vue
<template>
  <Box :padding="1">
    <TextBox color="cyan" bold>Title</TextBox>
    <TextBox>Regular text</TextBox>
    <TextBox dim>Subtitle</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

### With BigText

```vue
<template>
  <Box :padding="2" color="magenta" borderStyle="double">
    <BigText font="Slant">VUETTY</BigText>
  </Box>
</template>

<script setup>
import { Box, BigText } from 'vuetty';
</script>
```

### With ProgressBar

```vue
<template>
  <Box :padding="1" title="Loading..." color="cyan">
    <ProgressBar :value="75" :max="100" :width="30" />
  </Box>
</template>

<script setup>
import { Box, ProgressBar } from 'vuetty';
</script>
```
