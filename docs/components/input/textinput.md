# TextInput

The TextInput component provides a customizable text input field for single-line and multi-line text entry. It supports validation, styling, and keyboard navigation.

## Basic Usage

```vue
<template>
  <TextInput v-model="textValue" placeholder="Enter text..." />
</template>

<script setup>
import { ref } from 'vue';
import { TextInput } from 'vuetty';

const textValue = ref('');
</script>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | The input value (v-model binding) |
| `multiline` | `boolean` | `false` | Enable multi-line input mode |
| `rows` | `number` | `3` | Number of visible rows in multi-line mode |
| `minRows` | `number` | `1` | Minimum rows in auto-resize mode |
| `maxRows` | `number` | `undefined` | Maximum rows in auto-resize mode |
| `autoResize` | `boolean` | `true` | Automatically adjust height based on content |
| `width` | `number` | `undefined` | Fixed width in characters (auto if not set) |
| `wrapLines` | `boolean` | `true` | Enable line wrapping for long text |
| `label` | `string` | `''` | Label displayed above the input |
| `placeholder` | `string` | `''` | Placeholder text when input is empty |
| `hint` | `string\|boolean` | `'default'` | Hint text shown when focused. Use `'default'` for standard hints, `false` to disable, or pass custom text |
| `color` | `string` | `-` | Text color ([chalk color names](https://github.com/chalk/chalk?tab=readme-ov-file#styles)) |
| `borderColor` | `string` | `-` | Border color when not focused or in error |
| `bg` | `string` | `-` | Background color |
| `focusColor` | `string` | `'cyan'` | Border color when focused |
| `errorColor` | `string` | `'red'` | Border color when validation fails |
| `bold` | `boolean` | `false` | Bold text |
| `italic` | `boolean` | `false` | Italic text |
| `dim` | `boolean` | `false` | Dimmed text |
| `pattern` | `RegExp` | `-` | Validation regex pattern |
| `required` | `boolean` | `false` | Mark field as required |
| `maxLength` | `number` | `-` | Maximum character length |
| `disabled` | `boolean` | `false` | Disable input |
| `readonly` | `boolean` | `false` | Make input read-only |

## Input Modes

TextInput supports both single-line and multi-line modes:

```vue
<template>
  <Col :gap="1">
    <!-- Single-line input -->
    <TextInput v-model="username" placeholder="Enter username" />

    <!-- Multi-line input -->
    <TextInput
      v-model="description"
      multiline
      :rows="5"
      placeholder="Enter description..."
    />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, TextInput } from 'vuetty';

const username = ref('');
const description = ref('');
</script>
```

## Validation

TextInput provides built-in validation features:

```vue
<template>
  <Col :gap="1">
    <!-- Required field -->
    <TextInput
      v-model="email"
      required
      placeholder="Email is required"
    />

    <!-- Pattern validation -->
    <TextInput
      v-model="validatedEmail"
      :pattern="/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/"
      placeholder="Enter valid email"
    />

    <!-- Max length -->
    <TextInput
      v-model="username"
      :maxLength="20"
      placeholder="Max 20 characters"
    />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, TextInput } from 'vuetty';

const email = ref('');
const validatedEmail = ref('');
const username = ref('');
</script>
```

## Styling

Customize input appearance with colors and text effects:

```vue
<template>
  <Col :gap="1">
    <!-- Custom colors -->
    <TextInput
      v-model="text1"
      color="green"
      borderColor="white"
      focusColor="magenta"
      placeholder="Custom colors"
    />

    <!-- Text styling -->
    <TextInput
      v-model="text2"
      bold
      placeholder="Bold text input"
    />

    <!-- Combined styling -->
    <TextInput
      v-model="text3"
      bold
      italic
      color="cyan"
      placeholder="Bold italic cyan"
    />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, TextInput } from 'vuetty';

const text1 = ref('');
const text2 = ref('');
const text3 = ref('');
</script>
```

## Hints

Control hint text displayed when focused (hint text uses the input text color with dim styling):

```vue
<template>
  <Col :gap="1">
    <!-- Default hint (automatic based on input type) -->
    <TextInput v-model="text1" placeholder="Default hint" />

    <!-- Custom hint -->
    <TextInput
      v-model="text2"
      hint="Press Enter to confirm"
      placeholder="Custom hint"
    />

    <!-- No hint -->
    <TextInput
      v-model="text3"
      :hint="false"
      placeholder="No hint"
    />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, TextInput } from 'vuetty';

const text1 = ref('');
const text2 = ref('');
const text3 = ref('');
</script>
```

::: tip
Single-line inputs show "Enter to submit" by default, while multi-line inputs show "Ctrl+Enter to submit".
:::

## Width Control

Control input width with the `width` prop:

```vue
<template>
  <Col :gap="1">
    <!-- Fixed width -->
    <TextInput
      v-model="text1"
      :width="30"
      placeholder="Fixed width (30 chars)"
    />

    <!-- Auto width (default) -->
    <TextInput
      v-model="text2"
      placeholder="Auto width based on content"
    />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, TextInput } from 'vuetty';

const text1 = ref('');
const text2 = ref('');
</script>
```

## Events

TextInput supports change, focus, and blur events:

```vue
<template>
  <Col :gap="1">
    <!-- Change event -->
    <TextInput
      v-model="text1"
      @change="onChange"
      placeholder="Type and press Enter"
    />

    <!-- Focus and blur events -->
    <TextInput
      v-model="text2"
      @focus="onFocus"
      @blur="onBlur"
      placeholder="Focus and blur events"
    />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, TextInput } from 'vuetty';

const text1 = ref('');
const text2 = ref('');

const onChange = (value) => {
  console.log('Input submitted:', value);
};

const onFocus = () => {
  console.log('Input focused');
};

const onBlur = () => {
  console.log('Input blurred');
};
</script>
```

## Common Patterns

### Form Input with Validation

```vue
<template>
  <Col :gap="1">
    <TextInput
      v-model="username"
      label="Username"
      required
      placeholder="Enter username"
    />
    <TextInput
      v-model="email"
      label="Email"
      :pattern="/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/"
      placeholder="Enter email"
    />
    <TextInput
      v-model="notes"
      multiline
      :rows="5"
      label="Notes"
      placeholder="Enter your notes here..."
    />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, TextInput } from 'vuetty';

const username = ref('');
const email = ref('');
const notes = ref('');
</script>
```

### Search Field

```vue
<template>
  <TextInput
    v-model="searchQuery"
    placeholder="Search..."
    @change="onSearch"
  />
</template>

<script setup>
import { ref } from 'vue';
import { TextInput } from 'vuetty';

const searchQuery = ref('');

const onSearch = (query) => {
  console.log('Searching for:', query);
};
</script>
```

## Usage with Other Components

TextInput integrates seamlessly with layout components:

```vue
<template>
  <Col :gap="2">
    <!-- Input inside a box -->
    <Box :padding="1" color="cyan">
      <TextInput
        v-model="text"
        placeholder="Input inside a box"
      />
    </Box>

    <!-- Multiple inputs in a row -->
    <Row :gap="2">
      <Col :flex="1">
        <TextInput
          v-model="firstName"
          placeholder="First Name"
        />
      </Col>
      <Col :flex="1">
        <TextInput
          v-model="lastName"
          placeholder="Last Name"
        />
      </Col>
    </Row>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Box, Row, Col, TextInput } from 'vuetty';

const text = ref('');
const firstName = ref('');
const lastName = ref('');
</script>
```
