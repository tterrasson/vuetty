# Newline

The Newline component adds vertical space by inserting one or more newline characters. It is useful for controlling vertical spacing in terminal applications.

## Basic Usage

```vue
<template>
  <Col gap="1">
    <Text>Line 1</Text>
    <Newline />
    <Text>Line 2</Text>
  </Col>
</template>

<script setup>
import { Newline, Col, Text } from 'vuetty';
</script>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `1` | Number of newline characters to insert |

## Customization

### Multiple Newlines

```vue
<template>
  <Col gap="1">
    <Text>Line 1</Text>
    <Newline :count="2" />
    <Text>Line 2</Text>
  </Col>
</template>

<script setup>
import { Newline, Col, Text } from 'vuetty';
</script>
```

## Usage with Other Components

### With Box

```vue
<template>
  <Box :padding="1">
    <Text>First Line</Text>
    <Newline />
    <Text>Second Line</Text>
  </Box>
</template>

<script setup>
import { Newline, Box, Text } from 'vuetty';
</script>
```

### With Row and Col

```vue
<template>
  <Row gap="2">
    <Col flex="1">
      <Text>Column 1</Text>
      <Newline />
      <Text>Line 2</Text>
    </Col>
    <Col flex="1">
      <Text>Column 2</Text>
      <Newline />
      <Text>Line 2</Text>
    </Col>
  </Row>
</template>

<script setup>
import { Newline, Row, Col, Text } from 'vuetty';
</script>
```