# SelectInput

The SelectInput component provides an interactive dropdown selection list with keyboard navigation. It supports single selection, custom styling, and keyboard shortcuts for efficient navigation.

## Basic Usage

```vue
<template>
  <SelectInput
    v-model="selectedOption"
    :options="options"
    label="Choose an option"
  />
</template>

<script setup>
import { ref } from 'vue';
import { SelectInput } from 'vuetty';

const selectedOption = ref(null);
const options = ref([
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
]);
</script>
```

<!-- Video placeholder: selectinput-navigation.mp4 - Shows arrow key navigation and selection -->
*A dropdown selection list with keyboard navigation*

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `number` | `object` | `null` | The selected value (v-model binding) |
| `options` | `array` | `[]` | List of options (required) |
| `label` | `string` | `''` | Label displayed above the dropdown |
| `height` | `number` | `10` | Number of visible options in the dropdown |
| `width` | `number` | `-` | Width of the dropdown in characters |
| `flex` | `number` | `string` | `-` | Flex layout property |
| `flexGrow` | `number` | `-` | Flex grow property |
| `flexShrink` | `number` | `-` | Flex shrink property |
| `flexBasis` | `number` | `string` | `-` | Flex basis property |
| `disabled` | `boolean` | `false` | Disable the dropdown |
| `color` | `string` | `-` | Text color ([chalk color names](https://github.com/chalk/chalk?tab=readme-ov-file#styles)) |
| `bg` | `string` | `-` | Background color |
| `focusColor` | `string` | `'cyan'` | Border color when focused |
| `selectedColor` | `string` | `'green'` | Color for selected option |
| `highlightColor` | `string` | `'yellow'` | Color for highlighted option |
| `bold` | `boolean` | `false` | Bold text |
| `dim` | `boolean` | `false` | Dimmed text |
| `hint` | `string` | `boolean` | `'default'` | Hint text shown when focused. Set to `false` to hide, `'default'` for default hint, or a custom string |

## Options Format

The `options` prop accepts an array of objects with the following structure:

```js
{
  value: any,       // The value returned when selected
  label: string,    // The display text for the option
  disabled: boolean // Optional: disable this option
}
```

## Basic Examples

### Simple Dropdown

```vue
<template>
  <SelectInput
    v-model="selectedOption"
    :options="options"
  />
</template>

<script setup>
import { ref } from 'vue';
import { SelectInput } from 'vuetty';

const selectedOption = ref(null);
const options = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' }
]);
</script>
```

### With Label

```vue
<template>
  <SelectInput
    v-model="selectedOption"
    :options="options"
    label="Select a fruit"
  />
</template>

<script setup>
import { ref } from 'vue';
import { SelectInput } from 'vuetty';

const selectedOption = ref(null);
const options = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' }
]);
</script>
```

### Custom Height

```vue
<template>
  <SelectInput
    v-model="selectedOption"
    :options="options"
    :height="5"
  />
</template>

<script setup>
import { ref } from 'vue';
import { SelectInput } from 'vuetty';

const selectedOption = ref(null);
const options = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
  { value: 'grape', label: 'Grape' },
  { value: 'melon', label: 'Melon' }
]);
</script>
```

## Keyboard Navigation

The SelectInput component supports the following keyboard shortcuts:

- **↑ (Up Arrow)**: Move highlight up
- **↓ (Down Arrow)**: Move highlight down
- **Home**: Jump to first option
- **End**: Jump to last option
- **Page Up**: Move up by page height
- **Page Down**: Move down by page height
- **Enter/Space**: Select highlighted option
- **Type characters**: Jump to option starting with typed character

## Customization

### Custom Colors

```vue
<template>
  <SelectInput
    v-model="selectedOption"
    :options="options"
    focusColor="magenta"
    selectedColor="blue"
    highlightColor="cyan"
  />
</template>

<script setup>
import { ref } from 'vue';
import { SelectInput } from 'vuetty';

const selectedOption = ref(null);
const options = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' }
]);
</script>
```

### Text Styling

```vue
<template>
  <SelectInput
    v-model="selectedOption"
    :options="options"
    bold
  />
</template>

<script setup>
import { ref } from 'vue';
import { SelectInput } from 'vuetty';

const selectedOption = ref(null);
const options = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' }
]);
</script>
```

### Disabled Options

```vue
<template>
  <SelectInput
    v-model="selectedOption"
    :options="options"
  />
</template>

<script setup>
import { ref } from 'vue';
import { SelectInput } from 'vuetty';

const selectedOption = ref(null);
const options = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'orange', label: 'Orange' }
]);
</script>
```

### Custom Hint Text

```vue
<template>
  <SelectInput
    v-model="selectedOption"
    :options="options"
    hint="Use arrow keys to browse options"
  />
</template>

<script setup>
import { ref } from 'vue';
import { SelectInput } from 'vuetty';

const selectedOption = ref(null);
const options = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' }
]);
</script>
```

### Hide Hint Text

```vue
<template>
  <SelectInput
    v-model="selectedOption"
    :options="options"
    :hint="false"
  />
</template>

<script setup>
import { ref } from 'vue';
import { SelectInput } from 'vuetty';

const selectedOption = ref(null);
const options = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' }
]);
</script>
```

## Events

### Change Event

```vue
<template>
  <SelectInput
    v-model="selectedOption"
    :options="options"
    @change="onChange"
  />
</template>

<script setup>
import { ref } from 'vue';
import { SelectInput } from 'vuetty';

const selectedOption = ref(null);
const options = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' }
]);

const onChange = (value) => {
  console.log('Selected:', value);
};
</script>
```

### Focus and Blur Events

```vue
<template>
  <SelectInput
    v-model="selectedOption"
    :options="options"
    @focus="onFocus"
    @blur="onBlur"
  />
</template>

<script setup>
import { ref } from 'vue';
import { SelectInput } from 'vuetty';

const selectedOption = ref(null);
const options = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' }
]);

const onFocus = () => {
  console.log('Dropdown focused');
};

const onBlur = () => {
  console.log('Dropdown blurred');
};
</script>
```

## Common Patterns

### Form Input

```vue
<template>
  <Col gap="1">
    <TextInput v-model="username" placeholder="Enter username" />
    <SelectInput
      v-model="selectedRole"
      :options="roles"
      label="Select role"
    />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, TextInput, SelectInput } from 'vuetty';

const username = ref('');
const selectedRole = ref(null);
const roles = ref([
  { value: 'admin', label: 'Administrator' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' }
]);
</script>
```

### Multi-Select Workaround

```vue
<template>
  <Col gap="1">
    <SelectInput
      v-model="selectedOption"
      :options="availableOptions"
      label="Select an option"
    />
    <Box>
      <TextBox>Selected Options:</TextBox>
      <Newline />
      <TextBox v-for="option in selectedOptions" :key="option">
        {{ option }}
      </TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Col, SelectInput, Box, TextBox, Newline } from 'vuetty';

const selectedOption = ref(null);
const selectedOptions = ref([]);
const availableOptions = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' }
]);

watch(selectedOption, (newVal) => {
  if (newVal && !selectedOptions.value.includes(newVal)) {
    selectedOptions.value.push(newVal);
  }
});
</script>
```

## Usage with Other Components

### With Box

```vue
<template>
  <Box :padding="1" color="cyan">
    <SelectInput
      v-model="selectedOption"
      :options="options"
      label="Choose an option"
    />
  </Box>
</template>

<script setup>
import { ref } from 'vue';
import { Box, SelectInput } from 'vuetty';

const selectedOption = ref(null);
const options = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' }
]);
</script>
```

### With Row and Col

```vue
<template>
  <Row gap="2">
    <Col flex="1">
      <SelectInput
        v-model="selectedOption1"
        :options="options"
        label="Option 1"
      />
    </Col>
    <Col flex="1">
      <SelectInput
        v-model="selectedOption2"
        :options="options"
        label="Option 2"
      />
    </Col>
  </Row>
</template>

<script setup>
import { ref } from 'vue';
import { Row, Col, SelectInput } from 'vuetty';

const selectedOption1 = ref(null);
const selectedOption2 = ref(null);
const options = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' }
]);
</script>
```