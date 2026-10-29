# Spacer

The Spacer component inserts one or more spaces to control horizontal spacing in terminal apps.

## Basic Usage

```vue
<template>
  <Row gap="1">
    <TextBox>Left</TextBox>
    <Spacer />
    <TextBox>Right</TextBox>
  </Row>
</template>

<script setup>
import { Spacer, Row, TextBox } from 'vuetty';
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
    <TextBox>Left</TextBox>
    <Spacer :count="4" />
    <TextBox>Right</TextBox>
  </Row>
</template>

<script setup>
import { Spacer, Row, TextBox } from 'vuetty';
</script>
```

## Usage with Other Components

### With Box

```vue
<template>
  <Box :padding="1">
    <TextBox>Start</TextBox>
    <Spacer />
    <TextBox>End</TextBox>
  </Box>
</template>

<script setup>
import { Spacer, Box, TextBox } from 'vuetty';
</script>
```

### With Row and Col

```vue
<template>
  <Col gap="1">
    <Row gap="2">
      <TextBox>Item 1</TextBox>
      <Spacer />
      <TextBox>Item 2</TextBox>
    </Row>
    <Row gap="2">
      <TextBox>Item 3</TextBox>
      <Spacer />
      <TextBox>Item 4</TextBox>
    </Row>
  </Col>
</template>

<script setup>
import { Spacer, Row, Col, TextBox } from 'vuetty';
</script>
```
