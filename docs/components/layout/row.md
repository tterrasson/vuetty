# Row

The Row component creates a horizontal flex container for laying out components side-by-side. It's essential for creating multi-column layouts in terminal UIs.

## Basic Usage

```vue
<template>
  <Row>
    <Col flex="1">
      <Box :padding="1">
        <TextBox>Column 1</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1">
        <TextBox>Column 2</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1">
        <TextBox>Column 3</TextBox>
      </Box>
    </Col>
  </Row>
</template>

<script setup>
import { Row, Col, Box, TextBox } from 'vuetty';
</script>
```

<!-- Image placeholder: /images/components/row-basic.png - Basic Row -->
*Three equal-width columns in a row*

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `number` | `0` | Space between child elements |
| `justifyContent` | `string` | `'flex-start'` | Horizontal alignment: 'flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly' |
| `alignItems` | `string` | `'stretch'` | Vertical alignment: 'flex-start', 'flex-end', 'center', 'stretch', 'baseline' |
| `alignContent` | `string` | `null` | Multi-line content alignment (when wrapping) |
| `flexWrap` | `string` | `'nowrap'` | Wrap behavior: 'nowrap', 'wrap', 'wrap-reverse' |
| `responsive` | `boolean` | `false` | Enable responsive behavior (wraps based on child minWidth) |
| `width` | `number` | `null` | Container width (defaults to full terminal width) |
| `flex` | `number \| string` | - | Flex value when Row is inside another flex container |
| `flexGrow` | `number` | - | Flex grow factor |
| `flexShrink` | `number` | - | Flex shrink factor |
| `flexBasis` | `number \| string` | - | Flex basis value |
| `height` | `number` | `null` | Container height |
| `minWidth` | `number` | `0` | Minimum width |
| `maxWidth` | `number` | `null` | Maximum width |
| `minHeight` | `number` | `0` | Minimum height |
| `maxHeight` | `number` | `null` | Maximum height |
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

## Flex Ratios

Control the relative width of columns using the `flex` prop on child Col components:

### Equal Width (1:1:1)

```vue
<template>
  <Row>
    <Col flex="1">
      <Box :padding="1" color="cyan">
        <TextBox>1</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1" color="green">
        <TextBox>1</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1" color="blue">
        <TextBox>1</TextBox>
      </Box>
    </Col>
  </Row>
</template>

<script setup>
import { Row, Col, Box, TextBox } from 'vuetty';
</script>
```

### Custom Ratios (1:2:1)

```vue
<template>
  <Row>
    <Col flex="1">
      <Box :padding="1" color="cyan">
        <TextBox>1 unit</TextBox>
      </Box>
    </Col>
    <Col flex="2">
      <Box :padding="1" color="green">
        <TextBox>2 units (double width)</TextBox>
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
import { Row, Col, Box, TextBox } from 'vuetty';
</script>
```

### Sidebar Layout (1:3)

```vue
<template>
  <Row>
    <Col flex="1">
      <Box :padding="1" color="cyan">
        <TextBox bold>Sidebar</TextBox>
        <TextBox dim>Navigation</TextBox>
      </Box>
    </Col>
    <Col flex="3">
      <Box :padding="1" color="blue">
        <TextBox bold>Main Content</TextBox>
        <TextBox>This area is 3x wider than the sidebar</TextBox>
      </Box>
    </Col>
  </Row>
</template>

<script setup>
import { Row, Col, Box, TextBox } from 'vuetty';
</script>
```

<!-- Image placeholder: /images/components/row-flex-ratios.png - Flex Ratios -->
*Different flex ratio examples*

## Gap Spacing

Add space between columns:

```vue
<template>
  <Row gap="2">
    <Col flex="1">
      <Box :padding="1" color="green">
        <TextBox>Column 1</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1" color="blue">
        <TextBox>Column 2</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1" color="magenta">
        <TextBox>Column 3</TextBox>
      </Box>
    </Col>
  </Row>
</template>

<script setup>
import { Row, Col, Box, TextBox } from 'vuetty';
</script>
```

<!-- Image placeholder: /images/components/row-gap.png - Gap Spacing -->
*Row with gap={2} between columns*

## Horizontal Alignment (justifyContent)

### flex-start (Default)

Items align to the left:

```vue
<template>
  <Row justifyContent="flex-start">
    <Box :padding="1" color="cyan">
      <TextBox>Left</TextBox>
    </Box>
  </Row>
</template>

<script setup>
import { Row, Box, TextBox } from 'vuetty';
</script>
```

### center

Items align to the center:

```vue
<template>
  <Row justifyContent="center">
    <Box :padding="1" color="green">
      <TextBox>Centered</TextBox>
    </Box>
    <Box :padding="1" color="blue">
      <TextBox>Items</TextBox>
    </Box>
  </Row>
</template>

<script setup>
import { Row, Box, TextBox } from 'vuetty';
</script>
```

### flex-end

Items align to the right:

```vue
<template>
  <Row justifyContent="flex-end">
    <Box :padding="1" color="magenta">
      <TextBox>Right</TextBox>
    </Box>
  </Row>
</template>

<script setup>
import { Row, Box, TextBox } from 'vuetty';
</script>
```

### space-between

Items distributed with space between them:

```vue
<template>
  <Row justifyContent="space-between">
    <Box :padding="1" color="cyan">
      <TextBox>Left</TextBox>
    </Box>
    <Box :padding="1" color="green">
      <TextBox>Center</TextBox>
    </Box>
    <Box :padding="1" color="blue">
      <TextBox>Right</TextBox>
    </Box>
  </Row>
</template>

<script setup>
import { Row, Box, TextBox } from 'vuetty';
</script>
```

### space-around

Items distributed with space around them:

```vue
<template>
  <Row justifyContent="space-around">
    <Box :padding="1" color="cyan">
      <TextBox>A</TextBox>
    </Box>
    <Box :padding="1" color="green">
      <TextBox>B</TextBox>
    </Box>
    <Box :padding="1" color="blue">
      <TextBox>C</TextBox>
    </Box>
  </Row>
</template>

<script setup>
import { Row, Box, TextBox } from 'vuetty';
</script>
```

### space-evenly

Items distributed with equal space:

```vue
<template>
  <Row justifyContent="space-evenly">
    <Box :padding="1" color="cyan">
      <TextBox>A</TextBox>
    </Box>
    <Box :padding="1" color="green">
      <TextBox>B</TextBox>
    </Box>
    <Box :padding="1" color="blue">
      <TextBox>C</TextBox>
    </Box>
  </Row>
</template>

<script setup>
import { Row, Box, TextBox } from 'vuetty';
</script>
```

<!-- Image placeholder: /images/components/row-justify.png - Justify Content -->
*justifyContent alignment options*

## Vertical Alignment (alignItems)

### stretch (Default)

Items stretch to fill height:

```vue
<template>
  <Row alignItems="stretch">
    <Box :padding="2" color="cyan">
      <TextBox>Tall</TextBox>
    </Box>
    <Box :padding="1" color="green">
      <TextBox>Short</TextBox>
    </Box>
  </Row>
</template>

<script setup>
import { Row, Box, TextBox } from 'vuetty';
</script>
```

### center

Items vertically centered:

```vue
<template>
  <Row alignItems="center">
    <Box :padding="3" color="cyan">
      <TextBox>Very</TextBox>
      <TextBox>Tall</TextBox>
      <TextBox>Box</TextBox>
    </Box>
    <Box :padding="1" color="green">
      <TextBox>Short</TextBox>
    </Box>
  </Row>
</template>

<script setup>
import { Row, Box, TextBox } from 'vuetty';
</script>
```

### flex-start

Items align to top:

```vue
<template>
  <Row alignItems="flex-start">
    <Box :padding="2" color="cyan">
      <TextBox>Tall</TextBox>
    </Box>
    <Box :padding="1" color="green">
      <TextBox>Short</TextBox>
    </Box>
  </Row>
</template>

<script setup>
import { Row, Box, TextBox } from 'vuetty';
</script>
```

### flex-end

Items align to bottom:

```vue
<template>
  <Row alignItems="flex-end">
    <Box :padding="2" color="cyan">
      <TextBox>Tall</TextBox>
    </Box>
    <Box :padding="1" color="green">
      <TextBox>Short</TextBox>
    </Box>
  </Row>
</template>

<script setup>
import { Row, Box, TextBox } from 'vuetty';
</script>
```

<!-- Image placeholder: /images/components/row-align.png - Align Items -->
*alignItems vertical alignment options*

## Wrapping

Allow items to wrap to multiple lines:

```vue
<template>
  <Row :width="50" flexWrap="wrap" gap="1">
    <Col flex="1">
      <Box :padding="1" color="cyan">
        <TextBox>Item 1</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1" color="green">
        <TextBox>Item 2</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1" color="blue">
        <TextBox>Item 3</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1" color="magenta">
        <TextBox>Item 4</TextBox>
      </Box>
    </Col>
  </Row>
</template>

<script setup>
import { Row, Col, Box, TextBox } from 'vuetty';
</script>
```

<!-- Image placeholder: /images/components/row-wrap.png - Flex Wrap -->
*Items wrapping to multiple lines*

## Responsive Layouts

Use the `responsive` prop with `minWidth` on child columns for responsive behavior:

```vue
<template>
  <Row responsive gap="1">
    <Col :minWidth="25" flex="1">
      <Box :padding="1" color="cyan">
        <TextBox bold>Card 1</TextBox>
        <TextBox dim>Description</TextBox>
      </Box>
    </Col>
    <Col :minWidth="25" flex="1">
      <Box :padding="1" color="green">
        <TextBox bold>Card 2</TextBox>
        <TextBox dim>Description</TextBox>
      </Box>
    </Col>
    <Col :minWidth="25" flex="1">
      <Box :padding="1" color="blue">
        <TextBox bold>Card 3</TextBox>
        <TextBox dim>Description</TextBox>
      </Box>
    </Col>
    <Col :minWidth="25" flex="1">
      <Box :padding="1" color="magenta">
        <TextBox bold>Card 4</TextBox>
        <TextBox dim>Description</TextBox>
      </Box>
    </Col>
  </Row>
</template>

<script setup>
import { Row, Col, Box, TextBox } from 'vuetty';
</script>
```

Cards will wrap to new lines when the terminal is too narrow to fit them all.

<!-- Image placeholder: /images/components/row-responsive.png - Responsive Grid -->
*Responsive card grid that wraps based on terminal width*

## Common Patterns

### Header with Navigation

```vue
<template>
  <Row justifyContent="space-between" alignItems="center">
    <Box :padding="1" color="cyan">
      <TextBox bold>My App</TextBox>
    </Box>
    <Row gap="2">
      <TextBox color="blue">Home</TextBox>
      <TextBox color="blue">About</TextBox>
      <TextBox color="blue">Contact</TextBox>
    </Row>
  </Row>
</template>

<script setup>
import { Row, Box, TextBox } from 'vuetty';
</script>
```

### Three-Column Dashboard

```vue
<template>
  <Row gap="1">
    <Col flex="1">
      <Box :padding="1" title="Stats" color="cyan">
        <TextBox>CPU: 45%</TextBox>
        <TextBox>RAM: 62%</TextBox>
      </Box>
    </Col>
    <Col flex="2">
      <Box :padding="1" title="Activity" color="green">
        <TextBox>Main content area</TextBox>
      </Box>
    </Col>
    <Col flex="1">
      <Box :padding="1" title="Alerts" color="yellow">
        <TextBox>3 warnings</TextBox>
      </Box>
    </Col>
  </Row>
</template>

<script setup>
import { Row, Col, Box, TextBox } from 'vuetty';
</script>
```

### Button Row

```vue
<template>
  <Row gap="2" justifyContent="center">
    <Box :padding="1" color="green">
      <TextBox bold>Save</TextBox>
    </Box>
    <Box :padding="1" color="red">
      <TextBox bold>Cancel</TextBox>
    </Box>
    <Box :padding="1" color="blue">
      <TextBox bold>Help</TextBox>
    </Box>
  </Row>
</template>

<script setup>
import { Row, Box, TextBox } from 'vuetty';
</script>
```

## Nesting Rows and Cols

Create complex layouts by nesting:

```vue
<template>
  <Col gap="1">
    <!-- Header -->
    <Row>
      <Box :padding="1" color="cyan" borderStyle="double">
        <TextBox bold>Application Header</TextBox>
      </Box>
    </Row>

    <!-- Main content area -->
    <Row gap="1">
      <!-- Sidebar -->
      <Col flex="1">
        <Box :padding="1" color="green">
          <TextBox bold>Sidebar</TextBox>
        </Box>
      </Col>

      <!-- Content with nested rows -->
      <Col flex="3">
        <Row gap="1">
          <Col flex="1">
            <Box :padding="1" color="blue">
              <TextBox>Panel 1</TextBox>
            </Box>
          </Col>
          <Col flex="1">
            <Box :padding="1" color="magenta">
              <TextBox>Panel 2</TextBox>
            </Box>
          </Col>
        </Row>
      </Col>
    </Row>

    <!-- Footer -->
    <Row>
      <Box :padding="1" color="gray" borderStyle="dashed">
        <TextBox dim>Footer</TextBox>
      </Box>
    </Row>
  </Col>
</template>

<script setup>
import { Col, Row, Box, TextBox } from 'vuetty';
</script>
```