# Radiobox

An interactive single-select radio button list component that allows users to select exactly one option from a list. Supports keyboard navigation, custom styling, and responsive layouts.

## Basic Usage

### Vertical Layout (Default)

```vue
<template>
  <Col>
    <Radiobox
      v-model="selectedColor"
      label="Choose your favorite color:"
      :options="colorOptions"
      :height="5"
    />
    <Box :padding="1">
      <TextBox>Selected: {{ selectedColor || '(none)' }}</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Radiobox, Box, TextBox, Col } from 'vuetty';

const selectedColor = ref('blue');
const colorOptions = [
  { label: 'Red', value: 'red' },
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Purple', value: 'purple' }
];
</script>
```

### Horizontal Layout

```vue
<template>
  <Radiobox
    v-model="theme"
    label="Theme preference:"
    :options="themeOptions"
    direction="horizontal"
  />
</template>

<script setup>
import { ref } from 'vue';
import { Radiobox } from 'vuetty';

const theme = ref('light');
const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Auto', value: 'auto' }
];
</script>
```

### With Disabled Options

```vue
<template>
  <Radiobox
    v-model="membershipLevel"
    label="Select membership level:"
    :options="membershipOptions"
    :height="5"
  />
</template>

<script setup>
import { ref } from 'vue';
import { Radiobox } from 'vuetty';

const membershipLevel = ref('standard');
const membershipOptions = [
  { label: 'Free', value: 'free' },
  { label: 'Standard', value: 'standard' },
  { label: 'Premium', value: 'premium' },
  { label: 'Enterprise', value: 'enterprise', disabled: true }
];
</script>
```

## Props

### Model

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String \| Number \| Object` | `null` | The currently selected value (v-model) |

### Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array` | `[]` (required) | Array of option objects. Each option must have `label` and `value` properties. Can also include `disabled: true` to disable individual options. |

**Option Object Structure:**
```javascript
{
  label: 'Display Label',    // Text shown to user
  value: 'option-value',     // Value used in modelValue
  disabled: false            // Optional: mark as non-selectable
}
```

### Display

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | `''` | Label displayed above the radiobox list |
| `direction` | `String` | `'vertical'` | Layout direction: `'vertical'` or `'horizontal'` |
| `height` | `Number` | `10` | Number of visible items (vertical mode only) |
| `width` | `Number` | `null` | Component width in characters (null = auto) |
| `itemSpacing` | `Number` | `2` | Spacing between items in characters |

### Layout

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `flex` | `Number \| String` | `undefined` | Flex shorthand value |
| `flexGrow` | `Number` | `undefined` | Flex grow factor |
| `flexShrink` | `Number` | `undefined` | Flex shrink factor |
| `flexBasis` | `Number \| String` | `undefined` | Flex basis value |

### State

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `Boolean` | `false` | Disable the entire radiobox component |

### Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `String` | `undefined` | Text color (supports named colors and hex codes) |
| `bg` | `String` | `undefined` | Background color |
| `focusColor` | `String` | `'cyan'` | Color for focused item highlight |
| `selectedColor` | `String` | `'green'` | Color for selected radio indicators |
| `highlightColor` | `String` | `'yellow'` | Color for highlighted item cursor |
| `bold` | `Boolean` | `false` | Bold text |
| `dim` | `Boolean` | `false` | Dimmed text |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String \| Number \| Object` | Emitted when selection changes. The newly selected value. |
| `change` | `String \| Number \| Object` | Emitted when selection changes (same as update:modelValue) |
| `focus` | - | Emitted when component receives keyboard focus |
| `blur` | - | Emitted when component loses keyboard focus |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` / `←` | Move to previous option |
| `↓` / `→` | Move to next option |
| `Home` | Jump to first option |
| `End` | Jump to last option |
| `Page Up` | Move up one page (height) |
| `Page Down` | Move down one page (height) |
| `Space` / `Enter` | Select current option |
| `Tab` | Navigate to next focusable component |

## Advanced Examples

### Custom Styling

```vue
<template>
  <Radiobox
    v-model="priority"
    label="Select task priority:"
    :options="priorityOptions"
    :height="5"
    focus-color="magenta"
    selected-color="yellow"
    highlight-color="blue"
    color="white"
    bold
  />
</template>

<script setup>
import { ref } from 'vue';
import { Radiobox } from 'vuetty';

const priority = ref('medium');
const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' }
];
</script>
```

### Form Integration

```vue
<template>
  <Col>
    <Box border :padding="2" color="cyan">
      <TextBox bold>Configuration Wizard</TextBox>
    </Box>

    <Radiobox
      v-model="config.environment"
      label="Target environment:"
      :options="envOptions"
      :height="4"
      @change="onChange"
    />

    <Radiobox
      v-model="config.deployment"
      label="Deployment strategy:"
      :options="deploymentOptions"
      :height="4"
      @change="onChange"
    />

    <Box border :padding="1">
      <TextBox dim>Use arrow keys to navigate, Enter to select</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { reactive } from 'vue';
import { Radiobox, Box, TextBox, Col } from 'vuetty';

const config = reactive({
  environment: 'staging',
  deployment: 'rolling'
});

const envOptions = [
  { label: 'Development', value: 'development' },
  { label: 'Staging', value: 'staging' },
  { label: 'Production', value: 'production' }
];

const deploymentOptions = [
  { label: 'Rolling Update', value: 'rolling' },
  { label: 'Blue-Green', value: 'blue-green' },
  { label: 'Canary', value: 'canary' }
];

const onChange = (value) => {
  console.log('Selection changed:', value);
};
</script>
```

### Dynamic Options

```vue
<template>
  <Col>
    <Radiobox
      v-model="selectedServer"
      label="Select server:"
      :options="availableServers"
      :height="6"
    />
  </Col>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Radiobox, Col } from 'vuetty';

const servers = ref([
  { id: 1, name: 'Server A', status: 'online' },
  { id: 2, name: 'Server B', status: 'offline' },
  { id: 3, name: 'Server C', status: 'online' },
  { id: 4, name: 'Server D', status: 'online' }
]);

const selectedServer = ref(1);

const availableServers = computed(() => {
  return servers.value
    .filter(s => s.status === 'online')
    .map(s => ({
      label: `${s.name} (${s.status})`,
      value: s.id
    }));
});
</script>
```

### Conditional Selection

```vue
<template>
  <Col>
    <Radiobox
      v-model="plan"
      label="Select subscription plan:"
      :options="planOptions"
      :height="5"
    />

    <Box v-if="plan === 'premium'" :padding="1" margin-top="1" color="green">
      <TextBox bold>🎉 Premium plan selected!</TextBox>
      <Box :padding="1">
        <TextBox dim>You get access to all features</TextBox>
      </Box>
    </Box>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Radiobox, Box, TextBox, Col } from 'vuetty';

const plan = ref('basic');

const planOptions = [
  { label: 'Basic - $9/mo', value: 'basic' },
  { label: 'Pro - $19/mo', value: 'pro' },
  { label: 'Premium - $29/mo', value: 'premium' }
];
</script>
```