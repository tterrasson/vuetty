# Col

The Col component creates a vertical flex container for stacking child components vertically. It serves both as a standalone container and as a flex item within a Row component.

## Basic Usage

```vue
<template>
  <Col>
    <Box :padding="1" color="cyan">
      <TextBox>Item 1</TextBox>
    </Box>
    <Box :padding="1" color="green">
      <TextBox>Item 2</TextBox>
    </Box>
    <Box :padding="1" color="blue">
      <TextBox>Item 3</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { Col, Box, TextBox } from 'vuetty';
</script>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `flex` | `number \| string` | `'1'` | Flex grow factor when inside a flex container |
| `flexGrow` | `number` | `null` | Flex grow value |
| `flexShrink` | `number` | `null` | Flex shrink value |
| `flexBasis` | `number \| string` | `null` | Flex basis value |
| `alignSelf` | `string` | `null` | Vertical alignment: 'flex-start', 'flex-end', 'center', 'stretch', 'baseline' |
| `width` | `number \| string` | `null` | Explicit width |
| `height` | `number` | `null` | Explicit height |
| `minWidth` | `number` | `0` | Minimum width |
| `maxWidth` | `number` | `null` | Maximum width |
| `minHeight` | `number` | `0` | Minimum height |
| `maxHeight` | `number` | `null` | Maximum height |
| `gap` | `number` | `0` | Space between child elements |
| `justifyContent` | `string` | `'flex-start'` | Vertical alignment: 'flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly' |
| `alignItems` | `string` | `'stretch'` | Horizontal alignment: 'flex-start', 'flex-end', 'center', 'stretch', 'baseline' |
| `alignContent` | `string` | `null` | Multi-line content alignment (when wrapping) |
| `flexWrap` | `string` | `'nowrap'` | Wrap behavior: 'nowrap', 'wrap', 'wrap-reverse' |
| `responsive` | `boolean` | `false` | Enable responsive behavior |
| `padding` | `number` | `null` | Interior padding |
| `paddingLeft` | `number` | `null` | Left padding |
| `paddingRight` | `number` | `null` | Right padding |
| `paddingTop` | `number` | `null` | Top padding |
| `paddingBottom` | `number` | `null` | Bottom padding |
| `margin` | `number` | `null` | Exterior margin |
| `marginLeft` | `number` | `null` | Left margin |
| `marginRight` | `number` | `null` | Right margin |
| `marginTop` | `number` | `null` | Top margin |
| `marginBottom` | `number` | `null` | Bottom margin |

## Flex Sizing

Control the relative height of items using the `flex` prop:

### Equal Height (1:1:1)

```vue
<template>
  <Row gap="1">
    <Col flex="1">
      <Box :padding="1" color="cyan">
        <TextBox>1 unit</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1" color="green">
        <TextBox>1 unit</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1" color="blue">
        <TextBox>1 unit</TextBox>
      </Box>
    </Col>
  </Row>
</template>

<script setup>
import { Col, Row, Box, TextBox } from 'vuetty';
</script>
```

### Custom Ratios (2:1:1)

```vue
<template>
  <Row :gap="1">
    <Col :flex="2">
      <Box :padding="1" color="cyan">
        <TextBox bold>2 units</TextBox>
        <TextBox>Double height</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1" color="green">
        <TextBox>1 unit</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1" color="blue">
        <TextBox>1 unit</TextBox>
      </Box>
    </Col>
  </Row>
</template>

<script setup>
import { Col, Row, Box, TextBox } from 'vuetty';
</script>
```

## Gap Spacing

Add vertical space between child elements:

```vue
<template>
  <Col gap="2">
    <Box :padding="1" color="cyan">
      <TextBox>Item 1</TextBox>
    </Box>
    <Box :padding="1" color="green">
      <TextBox>Item 2</TextBox>
    </Box>
    <Box :padding="1" color="blue">
      <TextBox>Item 3</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { Col, Box, TextBox } from 'vuetty';
</script>
```

## Vertical Alignment (justifyContent)

### flex-start (Default)

Items align to the top:

```vue
<template>
  <Col :height="10" justifyContent="flex-start" border>
    <Box :padding="1" color="cyan">
      <TextBox>Top aligned</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { Col, Box, TextBox } from 'vuetty';
</script>
```

### center

Items align to the middle:

```vue
<template>
  <Col :height="10" justifyContent="center" border>
    <Box :padding="1" color="green">
      <TextBox>Centered</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { Col, Box, TextBox } from 'vuetty';
</script>
```

### flex-end

Items align to the bottom:

```vue
<template>
  <Col :height="10" justifyContent="flex-end" border>
    <Box :padding="1" color="blue">
      <TextBox>Bottom aligned</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { Col, Box, TextBox } from 'vuetty';
</script>
```

### space-between

Items distributed with space between them:

```vue
<template>
  <Col :height="10" justifyContent="space-between" border>
    <Box :padding="1" color="cyan">
      <TextBox>Top</TextBox>
    </Box>
    <Box :padding="1" color="blue">
      <TextBox>Bottom</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { Col, Box, TextBox } from 'vuetty';
</script>
```

## Horizontal Alignment (alignItems)

### stretch (Default)

Items stretch to fill width:

```vue
<template>
  <Col alignItems="stretch" :width="50">
    <Box :padding="1" color="cyan">
      <TextBox>Stretched</TextBox>
    </Box>
    <Box :padding="1" color="green">
      <TextBox>Stretched</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { Col, Box, TextBox } from 'vuetty';
</script>
```

### center

Items center horizontally:

```vue
<template>
  <Col alignItems="center" :width="50" gap="1">
    <Box :padding="1" color="cyan">
      <TextBox>Centered</TextBox>
    </Box>
    <Box :padding="1" color="green">
      <TextBox>Centered</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { Col, Box, TextBox } from 'vuetty';
</script>
```

## Sizing Constraints

### Fixed Dimensions

```vue
<template>
  <Col :width="30" :height="8">
    <Box :padding="1" color="cyan">
      <TextBox>Fixed size</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { Col, Box, TextBox } from 'vuetty';
</script>
```

### Min/Max Constraints

```vue
<template>
  <Col :minWidth="20" :maxWidth="60" :minHeight="5" :maxHeight="15">
    <Box :padding="1" color="green">
      <TextBox>Constrained</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { Col, Box, TextBox } from 'vuetty';
</script>
```

## Nesting Columns

Create complex multi-level layouts by nesting:

```vue
<template>
  <Col gap="1">
    <Row gap="1">
      <Col flex="1">
        <Box :padding="1" color="cyan">
          <TextBox>Top Left</TextBox>
        </Box>
      </Col>
      <Col flex="1">
        <Box :padding="1" color="green">
          <TextBox>Top Right</TextBox>
        </Box>
      </Col>
    </Row>
    <Row gap="1">
      <Col flex="1">
        <Box :padding="1" color="blue">
          <TextBox>Bottom Left</TextBox>
        </Box>
      </Col>
      <Col flex="1">
        <Box :padding="1" color="magenta">
          <TextBox>Bottom Right</TextBox>
        </Box>
      </Col>
    </Row>
  </Col>
</template>

<script setup>
import { Col, Row, Box, TextBox } from 'vuetty';
</script>
```

## Self Alignment (alignSelf)

Override parent alignment for individual items:

```vue
<template>
  <Row :height="8" gap="1" alignItems="flex-start">
    <Col alignSelf="flex-start" :padding="1">
      <Box color="cyan">
        <TextBox>Top</TextBox>
      </Box>
    </Col>
    <Col alignSelf="center" :padding="1">
      <Box color="green">
        <TextBox>Middle</TextBox>
      </Box>
    </Col>
    <Col alignSelf="flex-end" :padding="1">
      <Box color="blue">
        <TextBox>Bottom</TextBox>
      </Box>
    </Col>
  </Row>
</template>

<script setup>
import { Col, Row, Box, TextBox } from 'vuetty';
</script>
```

## Common Patterns

### Sidebar Navigation

```vue
<template>
  <Row gap="1">
    <Col :minWidth="20" flex="0">
      <Box :padding="1" color="cyan">
        <TextBox bold>Navigation</TextBox>
        <TextBox dim>Home</TextBox>
        <TextBox dim>About</TextBox>
        <TextBox dim>Contact</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1" color="green">
        <TextBox bold>Content</TextBox>
        <TextBox>Main content area</TextBox>
      </Box>
    </Col>
  </Row>
</template>

<script setup>
import { Col, Row, Box, TextBox } from 'vuetty';
</script>
```

### Card Stack

```vue
<template>
  <Col gap="1">
    <Box :padding="1" color="cyan" title="Card 1">
      <TextBox>Content here</TextBox>
    </Box>
    <Box :padding="1" color="green" title="Card 2">
      <TextBox>Content here</TextBox>
    </Box>
    <Box :padding="1" color="blue" title="Card 3">
      <TextBox>Content here</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { Col, Box, TextBox } from 'vuetty';
</script>
```