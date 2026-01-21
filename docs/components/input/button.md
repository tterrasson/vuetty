# Button

The Button component provides a customizable and interactive button for terminal applications. It supports various style variants, custom styling, keyboard navigation and mouse navigation.

## Basic Usage

```vue
<template>
  <Button label="Click Me" @click="onClick" />
</template>

<script setup>
import { Button } from 'vuetty';

const onClick = () => {
  console.log('Button clicked');
};
</script>
```

<!-- Image placeholder: /images/components/button-basic.png - Basic Button -->
*A simple button with a click handler*

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'primary'` | Style variant (primary, secondary, danger, warning, info, success) |
| `color` | `string` | `-` | Text color ([chalk color names](https://github.com/chalk/chalk?tab=readme-ov-file#styles)) |
| `bg` | `string` | `-` | Background color |
| `bold` | `boolean` | `false` | Bold text |
| `italic` | `boolean` | `false` | Italic text |
| `dim` | `boolean` | `false` | Dimmed text |
| `disabled` | `boolean` | `false` | Disable button |
| `fullWidth` | `boolean` | `false` | Expand button to fill parent container width |
| `flex` | `number` | `string` | `-` | Flex layout property |
| `flexGrow` | `number` | `-` | Flex grow property |
| `flexShrink` | `number` | `-` | Flex shrink property |
| `flexBasis` | `number` | `string` | `-` | Flex basis property |
| `focusColor` | `string` | `'brightYellow'` | Border color when focused |
| `focusBg` | `string` | `null` | Background color when focused |
| `underline` | `boolean` | `false` | Underlined text |

## Style Variants

```vue
<template>
  <Col :gap="1">
    <Row>
      <Col>
        <Button label="Primary" variant="primary" @click="onClick" />
      </Col>
      <Col>
        <Button label="Secondary" variant="secondary" @click="onClick" />
      </Col>
      <Col>
        <Button label="Info" variant="info" @click="onClick" />
      </Col>
    </Row>

    <Row>
      <Col>
        <Button label="Success" variant="success" @click="onClick" />
      </Col>
      <Col>
        <Button label="Warning" variant="warning" @click="onClick" />
      </Col>
      <Col>
        <Button label="Danger" variant="danger" @click="onClick" />
      </Col>
    </Row>

    <Row>
      <TextBox color="cyan">Counter: {{ count }}</TextBox>
    </Row>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Button, Col, Row, TextBox } from 'vuetty';

const count = ref(0);

const onClick = () => {
  count.value += 1;
};
</script>
```

## Custom Styling

Customize button appearance with colors and text effects:

```vue
<template>
  <Col :gap="1">
    <Button label="Custom Colors" color="green" bg="black" @click="onClick" />
    <Button label="Bold Text" bold @click="onClick" />
    <Button label="Italic Text" italic @click="onClick" />
    <Button label="Bold + Custom" bold color="yellow" @click="onClick" />
    <Button label="Underlined" underline @click="onClick" />
  </Col>
</template>

<script setup>
import { Button, Col } from 'vuetty';

const onClick = () => {
  console.log('Button clicked');
};
</script>
```

## Disabled State

```vue
<template>
  <Button label="Disabled" disabled />
</template>

<script setup>
import { Button } from 'vuetty';
</script>
```

## Focus Styling

Customize focus appearance with focus colors and background:

```vue
<template>
  <Col :gap="1">
    <Button label="Default Focus" @click="onClick" />
    <Button label="Custom Focus Color" focusColor="red" @click="onClick" />
    <Button label="Custom Focus Background" focusBg="blue" @click="onClick" />
    <Button label="Both Custom" focusColor="magenta" focusBg="cyan" @click="onClick" />
  </Col>
</template>

<script setup>
import { Button, Col } from 'vuetty';

const onClick = () => {
  console.log('Button clicked');
};
</script>
```

## Events

Button supports click, focus, and blur events:

```vue
<template>
  <Col :gap="1">
    <Button label="Click Me" @click="onClick" />
    <Button label="Focus and Blur Events" @focus="onFocus" @blur="onBlur" />
  </Col>
</template>

<script setup>
import { Button, Col } from 'vuetty';

const onClick = () => {
  console.log('Button clicked');
};

const onFocus = () => {
  console.log('Button focused');
};

const onBlur = () => {
  console.log('Button blurred');
};
</script>
```

## Common Patterns

### Form Submission

```vue
<template>
  <Col :gap="1">
    <TextInput v-model="username" placeholder="Enter username" />
    <Button label="Submit" @click="onClick" />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Button, Col, TextInput } from 'vuetty';

const username = ref('');

const onClick = () => {
  console.log('Form submitted:', username.value);
};
</script>
```

### Action Buttons

```vue
<template>
  <Row :gap="2">
    <Button label="Save" variant="success" @click="onSave" />
    <Button label="Cancel" variant="secondary" @click="onCancel" />
  </Row>
</template>

<script setup>
import { Button, Row } from 'vuetty';

const onSave = () => {
  console.log('Save action');
};

const onCancel = () => {
  console.log('Cancel action');
};
</script>
```

## Full Width Buttons

Use `fullWidth` to make buttons expand to fill their parent container:

```vue
<template>
  <Row :gap="1">
    <Col>
      <Button label="Normal" @click="onClick" />
    </Col>
    <Col :flex="2">
      <Button label="Full Width" fullWidth @click="onClick" />
    </Col>
  </Row>
</template>

<script setup>
import { Button, Row, Col } from 'vuetty';

const onClick = () => {
  console.log('Button clicked');
};
</script>
```

## Usage with Other Components

Buttons can be easily combined with layout components:

```vue
<template>
  <Col :gap="2">
    <!-- Button in a Box -->
    <Box :padding="1" color="cyan">
      <Button label="Inside Box" @click="onClick" />
    </Box>

    <!-- Full width buttons in Row -->
    <Row :gap="2">
      <Col :flex="1">
        <Button label="Button 1" fullWidth @click="onClick" />
      </Col>
      <Col :flex="1">
        <Button label="Button 2" fullWidth @click="onClick" />
      </Col>
    </Row>
  </Col>
</template>

<script setup>
import { Button, Box, Row, Col } from 'vuetty';

const onClick = () => {
  console.log('Button clicked');
};
</script>
```