# Newline

The Newline component inserts one or more newline characters to control vertical spacing in terminal apps.

## Basic Usage

```vue
<template>
  <Col gap="1">
    <TextBox>Line 1</TextBox>
    <Newline />
    <TextBox>Line 2</TextBox>
  </Col>
</template>

<script setup>
import { Newline, Col, TextBox } from 'vuetty';
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
    <TextBox>Line 1</TextBox>
    <Newline :count="2" />
    <TextBox>Line 2</TextBox>
  </Col>
</template>

<script setup>
import { Newline, Col, TextBox } from 'vuetty';
</script>
```

## Usage with Other Components

### With Box

```vue
<template>
  <Box :padding="1">
    <TextBox>First Line</TextBox>
    <Newline />
    <TextBox>Second Line</TextBox>
  </Box>
</template>

<script setup>
import { Newline, Box, TextBox } from 'vuetty';
</script>
```

### With Row and Col

```vue
<template>
  <Row gap="2">
    <Col flex="1">
      <TextBox>Column 1</TextBox>
      <Newline />
      <TextBox>Line 2</TextBox>
    </Col>
    <Col flex="1">
      <TextBox>Column 2</TextBox>
      <Newline />
      <TextBox>Line 2</TextBox>
    </Col>
  </Row>
</template>

<script setup>
import { Newline, Row, Col, TextBox } from 'vuetty';
</script>
```
