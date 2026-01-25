# SelectInput

The SelectInput component provides an interactive dropdown list with keyboard navigation and v-model support. Use it for single or multi-select with customizable styling and keyboard shortcuts.

## Basic Usage

```vue
<template>
  <Col :gap="1">
    <TextBox bold color="cyan">SelectInput</TextBox>
    <SelectInput v-model="selected" label="Pick one" :options="options" :height="6" />
    <TextBox color="green">Selected: {{ selected }}</TextBox>
    <SelectInput v-model="role" label="Role" :options="roleOptions" :height="4" />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, SelectInput, TextBox } from 'vuetty';

const options = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
  { label: 'Gamma', value: 'gamma' },
  { label: 'Delta', value: 'delta' },
  { label: 'Epsilon', value: 'epsilon' }
];

const selected = ref('beta');

const roleOptions = [
  { label: 'Admin', value: 'admin', disabled: true },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' }
];

const role = ref('viewer');
</script>
```

<!-- Video placeholder: selectinput-navigation.mp4 - Shows arrow key navigation and selection -->
*A dropdown selection list with keyboard navigation*

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \\| number \\| object \\| array` | `null` | The selected value (v-model binding). Use an array for multi-selection |
| `options` | `array` | `[]` | List of options |
| `label` | `string` | `''` | Label displayed above the dropdown |
| `height` | `number` | `10` | Number of visible options in the dropdown |
| `width` | `number` | `undefined` | Width of the dropdown in characters |
| `disabled` | `boolean` | `false` | Disable the dropdown |
| `multiple` | `boolean` | `false` | Enable multi-selection mode |
| `color` | `string` | `-` | Text color ([chalk color names](https://github.com/chalk/chalk?tab=readme-ov-file#styles)) |
| `bg` | `string` | `-` | Background color |
| `focusColor` | `string` | `'cyan'` | Border color when focused |
| `selectedColor` | `string` | `'green'` | Color for selected option |
| `highlightColor` | `string` | `'yellow'` | Color for highlighted option |
| `marker` | `string` | `'●'` | Marker for selected option |
| `highlightMarker` | `string` | `'▸'` | Marker for highlighted option |
| `bold` | `boolean` | `false` | Bold text |
| `dim` | `boolean` | `false` | Dimmed text |
| `hint` | `string \\| boolean` | `'default'` | Hint text shown when focused. Set to `false` to hide, `'default'` for default hint, or a custom string |

## Layout Props (Box Props)

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `flex` | `number \\| string` | `null` | Flex shorthand when inside a flex container |
| `flexGrow` | `number` | `null` | Flex grow factor |
| `flexShrink` | `number` | `null` | Flex shrink factor |
| `flexBasis` | `number \\| string` | `null` | Flex basis |
| `alignSelf` | `string` | `null` | Self alignment: 'auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline' |
| `width` | `number \\| string` | `undefined` | Width (chars or %) |
| `height` | `number \\| string` | `10` | Height (rows) |
| `minWidth` | `number` | `null` | Minimum width |
| `maxWidth` | `number` | `null` | Maximum width |
| `minHeight` | `number` | `null` | Minimum height |
| `maxHeight` | `number` | `null` | Maximum height |
| `padding` | `number` | `null` | Padding |
| `paddingLeft` | `number` | `null` | Left padding |
| `paddingRight` | `number` | `null` | Right padding |
| `paddingTop` | `number` | `null` | Top padding |
| `paddingBottom` | `number` | `null` | Bottom padding |
| `margin` | `number` | `null` | Margin |
| `marginLeft` | `number` | `null` | Left margin |
| `marginRight` | `number` | `null` | Right margin |
| `marginTop` | `number` | `null` | Top margin |
| `marginBottom` | `number` | `null` | Bottom margin |

## Options Format

The `options` prop accepts an array of objects or primitive values:

```js
// Object format (recommended for full control)
{
  value: any,       // The value returned when selected
  label: string,    // The display text for the option
  disabled: boolean // Optional: disable this option
}

// Primitive format (label is derived from value)
'Simple String'
42
```

## Examples

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

## Multi-Selection

Enable multi-selection mode by setting the `multiple` prop to `true`. In this mode, the `modelValue` should be an array of selected values.

### Basic Multi-Select

```vue
<template>
  <Col :gap="1">
    <SelectInput
      v-model="selectedFruits"
      :options="fruits"
      label="Select your favorite fruits"
      :height="6"
      multiple
    />
    <TextBox color="green">Selected: {{ selectedFruits.join(', ') }}</TextBox>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, SelectInput, TextBox } from 'vuetty';

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' }
];

const selectedFruits = ref(['apple', 'cherry']);
</script>
```

### Multi-Select with Initial Selection

```vue
<template>
  <SelectInput
    v-model="selectedTags"
    :options="tags"
    label="Select tags"
    :height="5"
    multiple
  />
</template>

<script setup>
import { ref } from 'vue';
import { SelectInput } from 'vuetty';

const tags = [
  { label: 'JavaScript', value: 'js' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Vue.js', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Node.js', value: 'node' }
];

const selectedTags = ref(['vue', 'ts']);
</script>
```

## Keyboard Navigation

The SelectInput component supports the following keyboard shortcuts:

### Single Selection Mode
- **↑ (Up Arrow)**: Move highlight up
- **↓ (Down Arrow)**: Move highlight down
- **Home**: Jump to first option
- **End**: Jump to last option
- **Page Up**: Move up by page height
- **Page Down**: Move down by page height
- **Enter**: Select highlighted option
- **Type characters**: Jump to option starting with typed character

### Multi-Selection Mode
- **↑ (Up Arrow)**: Move highlight up
- **↓ (Down Arrow)**: Move highlight down
- **Home**: Jump to first option
- **End**: Jump to last option
- **Page Up**: Move up by page height
- **Page Down**: Move down by page height
- **Space**: Toggle selection of highlighted option
- **Enter**: Confirm selection (moves focus to next field)
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

### Custom Markers

```vue
<template>
  <SelectInput
    v-model="selectedOption"
    :options="options"
    marker="✓"
    highlightMarker="→"
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

### Primitive Options

```vue
<template>
  <SelectInput
    v-model="selectedFruit"
    :options="['Apple', 'Banana', 'Cherry']"
    label="Select a fruit"
  />
</template>

<script setup>
import { ref } from 'vue';
import { SelectInput } from 'vuetty';

const selectedFruit = ref(null);
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

### Multi-Select Form

```vue
<template>
  <Col gap="1">
    <SelectInput
      v-model="selectedTechnologies"
      :options="technologies"
      label="Select technologies you know"
      :height="8"
      multiple
    />
    <Box v-if="selectedTechnologies.length > 0">
      <TextBox bold color="cyan">You selected:</TextBox>
      <Newline />
      <TextBox v-for="tech in selectedTechnologies" :key="tech" color="green">
        • {{ technologies.find(t => t.value === tech)?.label }}
      </TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, SelectInput, Box, TextBox, Newline } from 'vuetty';

const technologies = ref([
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'react', label: 'React' },
  { value: 'node', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' }
]);

const selectedTechnologies = ref([]);
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

## Comparison with List

Use **SelectInput** when you want to:
- Let users select from options (forms, user input)
- Support v-model binding
- Enable keyboard navigation
- Handle user interactions

Use **List** when you want to:
- Display static data (no user interaction)
- Show information or status
- Create visual indicators

```vue
<template>
  <Row gap="4">
    <!-- Static display with List -->
    <Col flex="1">
      <List
        :items="features"
        label="Available Features"
      />
    </Col>

    <!-- Interactive selection with SelectInput -->
    <Col flex="1">
      <SelectInput
        v-model="selectedFeature"
        :options="features"
        label="Select a feature to enable"
      />
    </Col>
  </Row>
</template>

<script setup>
import { ref } from 'vue';
import { Row, Col, List, SelectInput } from 'vuetty';

const features = ref([
  { label: 'Authentication', value: 'auth' },
  { label: 'Database', value: 'db' },
  { label: 'API', value: 'api' }
]);

const selectedFeature = ref(null);
</script>
```
