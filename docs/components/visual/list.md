# List

The List component renders a static, non-interactive list for displaying data. Unlike SelectInput, it doesn't support keyboard navigation or selection - it's purely for display purposes.

## Basic Example

```vue
<template>
  <Col :gap="1">
    <TextBox bold color="cyan">List</TextBox>
    <List :items="items" label="Features" />
    <List :items="statusItems" highlightedValue="active" />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, List, TextBox } from 'vuetty';

const items = ['Feature 1', 'Feature 2', 'Feature 3'];

const statusItems = [
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' }
];
</script>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `array` | `[]` | List items (required) |
| `label` | `string` | `''` | Label displayed above the list |
| `height` | `number` | `undefined` | Max number of items to display (shows counter if exceeded) |
| `width` | `number` | `undefined` | Content width in characters |
| `marker` | `string` | `'•'` | Marker for highlighted item |
| `highlightedValue` | `string \| number \| object` | `null` | Value to visually highlight (non-interactive) |
| `color` | `string` | `-` | Text color ([chalk color names](https://github.com/chalk/chalk?tab=readme-ov-file#styles)) |
| `bg` | `string` | `-` | Background color |
| `highlightColor` | `string` | `'cyan'` | Color for highlighted item |
| `bold` | `boolean` | `false` | Bold text |
| `dim` | `boolean` | `false` | Dimmed text |
| `flex` | `number \| string` | `undefined` | Flex layout shorthand |
| `flexGrow` | `number` | `undefined` | Flex grow factor |
| `flexShrink` | `number` | `undefined` | Flex shrink factor |
| `flexBasis` | `number \| string` | `undefined` | Flex basis value |

## Items Format

You can provide items as objects or primitive values (strings, numbers, etc.). Objects give you full control over labels and values.

```js
// Object format
{ label: 'Display Text', value: 'internal_value' }

// Primitive format (label is derived from the value)
'Simple String'
123
```

## Examples

### Simple List

```vue
<template>
  <List :items="['Apple', 'Banana', 'Cherry']" />
</template>

<script setup>
import { List } from 'vuetty';
</script>
```

### With Label

```vue
<template>
  <List :items="items" label="Available Options" />
</template>

<script setup>
import { ref } from 'vue';
import { List } from 'vuetty';

const items = ref([
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c' }
]);
</script>
```

### Highlighted Item

Use `highlightedValue` to visually emphasize an item (non-interactive):

```vue
<template>
  <List
    :items="items"
    :highlightedValue="currentStatus"
    label="Status"
  />
</template>

<script setup>
import { ref } from 'vue';
import { List } from 'vuetty';

const items = ref([
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' }
]);

const currentStatus = ref('in_progress');
</script>
```

### Custom Marker

```vue
<template>
  <List
    :items="items"
    :highlightedValue="'beta'"
    marker="→"
  />
</template>

<script setup>
import { ref } from 'vue';
import { List } from 'vuetty';

const items = ref([
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
  { label: 'Gamma', value: 'gamma' }
]);
</script>
```

### Limited Height

Display only a subset of items:

```vue
<template>
  <List :items="manyItems" :height="5" />
</template>

<script setup>
import { ref } from 'vue';
import { List } from 'vuetty';

const manyItems = ref(
  Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`)
);
</script>
```

When items exceed the height, a counter is shown: `[showing 5 of 20 items]`

### Styled List

```vue
<template>
  <List
    :items="items"
    color="green"
    bold
    highlightColor="yellow"
    :highlightedValue="'active'"
  />
</template>

<script setup>
import { ref } from 'vue';
import { List } from 'vuetty';

const items = ref([
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]);
</script>
```

## Common Patterns

### Display Array Data

```vue
<template>
  <Col gap="1">
    <TextBox bold>Recent Logs:</TextBox>
    <List :items="logs" />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, TextBox, List } from 'vuetty';

const logs = ref([
  'Server started on port 3000',
  'Database connection established',
  'API endpoint registered'
]);
</script>
```

### Status Indicator

```vue
<template>
  <Row gap="2">
    <Col flex="1">
      <List
        :items="statuses"
        :highlightedValue="currentStatus"
        label="Pipeline Status"
        highlightColor="green"
      />
    </Col>
  </Row>
</template>

<script setup>
import { ref } from 'vue';
import { Row, Col, List } from 'vuetty';

const statuses = ref([
  { label: 'Build', value: 'build' },
  { label: 'Test', value: 'test' },
  { label: 'Deploy', value: 'deploy' }
]);

const currentStatus = ref('test');
</script>
```

### Comparison with SelectInput

Use **List** when you want to:
- Display static data
- Show information without user interaction
- Create visual indicators (like progress steps)

Use **SelectInput** when you want to:
- Let users select from options
- Handle user input with v-model
- Support keyboard navigation

```vue
<template>
  <Row gap="4">
    <!-- Static display -->
    <Col flex="1">
      <TextBox bold>Available Features:</TextBox>
      <List :items="features" />
    </Col>

    <!-- Interactive selection -->
    <Col flex="1">
      <SelectInput
        v-model="selectedFeature"
        :options="features"
        label="Select a feature"
      />
    </Col>
  </Row>
</template>

<script setup>
import { ref } from 'vue';
import { Row, Col, TextBox, List, SelectInput } from 'vuetty';

const features = ref([
  { label: 'Authentication', value: 'auth' },
  { label: 'Database', value: 'db' },
  { label: 'API', value: 'api' }
]);

const selectedFeature = ref(null);
</script>
```
