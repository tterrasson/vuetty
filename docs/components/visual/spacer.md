# Spacer

The Spacer component inserts one or more spaces to control horizontal spacing in terminal apps.

## Basic Usage

```vue
<template>
  <Row gap="1">
    <Text>Left</Text>
    <Spacer />
    <Text>Right</Text>
  </Row>
</template>

<script setup>
import { Spacer, Row, Text } from 'vuetty';
</script>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `1` | Number of space characters to insert |

## Customization

### Multiple Spaces

```vue
<template>
  <Row gap="1">
    <Text>Left</Text>
    <Spacer :count="4" />
    <Text>Right</Text>
  </Row>
</template>

<script setup>
import { Spacer, Row, Text } from 'vuetty';
</script>
```

## Usage with Other Components

### With Box

```vue
<template>
  <Box :padding="1">
    <Text>Start</Text>
    <Spacer />
    <Text>End</Text>
  </Box>
</template>

<script setup>
import { Spacer, Box, Text } from 'vuetty';
</script>
```

### With Row and Col

```vue
<template>
  <Col gap="1">
    <Row gap="2">
      <Text>Item 1</Text>
      <Spacer />
      <Text>Item 2</Text>
    </Row>
    <Row gap="2">
      <Text>Item 3</Text>
      <Spacer />
      <Text>Item 4</Text>
    </Row>
  </Col>
</template>

<script setup>
import { Spacer, Row, Col, Text } from 'vuetty';
</script>
```
