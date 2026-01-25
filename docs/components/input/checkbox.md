# Checkbox

An interactive multi-select checkbox list component that allows users to select one or more options from a list. Supports keyboard navigation, custom styling, and responsive layouts.

## Basic Usage

Checkbox supports both vertical and horizontal layouts:

```vue
<template>
  <Col :gap="2">
    <!-- Vertical layout (default) -->
    <Checkbox
      v-model="selectedFruits"
      label="Select your favorite fruits:"
      :options="fruitOptions"
      :height="5"
    />

    <!-- Show selected -->
    <Box :padding="1">
      <TextBox>Selected: {{ selectedFruits.join(', ') }}</TextBox>
    </Box>

    <!-- Horizontal layout -->
    <Checkbox
      v-model="notifications"
      label="Notification preferences:"
      :options="notificationOptions"
      direction="horizontal"
    />

    <!-- With disabled options -->
    <Checkbox
      v-model="selectedRoles"
      label="Assign user roles:"
      :options="roleOptions"
      :height="6"
    />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Checkbox, Box, TextBox, Col } from 'vuetty';

const selectedFruits = ref(['apple']);
const fruitOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Orange', value: 'orange' },
  { label: 'Grape', value: 'grape' },
  { label: 'Mango', value: 'mango' }
];

const notifications = ref(['email']);
const notificationOptions = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Push', value: 'push' }
];

const selectedRoles = ref(['user']);
const roleOptions = [
  { label: 'Administrator', value: 'admin', disabled: true },
  { label: 'Moderator', value: 'moderator' },
  { label: 'User', value: 'user' },
  { label: 'Guest', value: 'guest' }
];
</script>
```

## Props

### Model

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Array` | `[]` | Array of selected values (v-model) |

### Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array` | `[]` | Array of option objects. Each option must have `label` and `value` properties. Can also include `disabled: true` to disable individual options. |

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
| `label` | `String` | `''` | Label displayed above the checkbox list |
| `direction` | `String` | `'vertical'` | Layout direction: `'vertical'` or `'horizontal'` |
| `height` | `Number \| String` | `null` | Number of visible items (vertical mode only) |
| `width` | `Number \| String` | `null` | Component width in characters (null = auto) |
| `itemSpacing` | `Number` | `2` | Spacing between items in characters |
| `hint` | `String \| Boolean` | `'default'` | Hint text shown when focused. Use `'default'` for standard hints, `false` to disable, or pass custom text |

### State

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `Boolean` | `false` | Disable the entire checkbox component |

### Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `String` | `undefined` | Text color (supports named colors and hex codes) |
| `bg` | `String` | `undefined` | Background color |
| `focusColor` | `String` | `'cyan'` | Color for focused item highlight |
| `selectedColor` | `String` | `'green'` | Color for selected checkbox indicators |
| `highlightColor` | `String` | `'yellow'` | Color for highlighted item cursor |
| `bold` | `Boolean` | `false` | Bold text |
| `dim` | `Boolean` | `false` | Dimmed text |

### Layout Props (Box Props)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `flex` | `Number \| String` | `null` | Flex shorthand when inside a flex container |
| `flexGrow` | `Number` | `null` | Flex grow factor |
| `flexShrink` | `Number` | `null` | Flex shrink factor |
| `flexBasis` | `Number \| String` | `null` | Flex basis |
| `alignSelf` | `String` | `null` | Self alignment: 'auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline' |
| `width` | `Number \| String` | `null` | Width (chars or %) |
| `height` | `Number \| String` | `null` | Height (rows) |
| `minWidth` | `Number` | `null` | Minimum width |
| `maxWidth` | `Number` | `null` | Maximum width |
| `minHeight` | `Number` | `null` | Minimum height |
| `maxHeight` | `Number` | `null` | Maximum height |
| `padding` | `Number` | `null` | Padding |
| `paddingLeft` | `Number` | `null` | Left padding |
| `paddingRight` | `Number` | `null` | Right padding |
| `paddingTop` | `Number` | `null` | Top padding |
| `paddingBottom` | `Number` | `null` | Bottom padding |
| `margin` | `Number` | `null` | Margin |
| `marginLeft` | `Number` | `null` | Left margin |
| `marginRight` | `Number` | `null` | Right margin |
| `marginTop` | `Number` | `null` | Top margin |
| `marginBottom` | `Number` | `null` | Bottom margin |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Array` | Emitted when selection changes. The new array of selected values. |
| `change` | `Array` | Emitted when selection changes (same as update:modelValue) |
| `focus` | - | Emitted when component receives keyboard focus |
| `blur` | - | Emitted when component loses keyboard focus |

## Hints

Checkbox displays helpful keyboard hints when focused. You can customize or disable these hints.

### Controlling Hints

By default, Checkbox shows direction-aware navigation hints:

```vue
<template>
  <!-- Default hint - automatically adjusts for direction -->
  <Checkbox
    v-model="selected"
    :options="options"
    direction="vertical"
  />
  <!-- Shows: "↑↓ Navigate • Space/Enter to toggle • Tab to next field" -->

  <!-- Custom hint text -->
  <Checkbox
    v-model="selected"
    :options="options"
    hint="Press Space to toggle selected items"
  />

  <!-- Disable hints -->
  <Checkbox
    v-model="selected"
    :options="options"
    :hint="false"
  />
</template>

<script setup>
import { ref } from 'vue';
import { Checkbox } from 'vuetty';

const selected = ref([]);
const options = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3', value: 'opt3' }
];
</script>
```

::: tip
Default hints automatically adjust based on the `direction` prop:
- Vertical: Shows `↑↓` arrow indicators
- Horizontal: Shows `←→` arrow indicators
:::

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` / `←` | Move to previous option |
| `↓` / `→` | Move to next option |
| `Home` | Jump to first option |
| `End` | Jump to last option |
| `Page Up` | Move up one page (height) |
| `Page Down` | Move down one page (height) |
| `Space` / `Enter` | Toggle current option selection |
| `Tab` | Navigate to next focusable component |

## Advanced Examples

### Custom Styling

```vue
<template>
  <Checkbox
    v-model="features"
    label="Select features to enable:"
    :options="featureOptions"
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
import { Checkbox } from 'vuetty';

const features = ref(['caching']);
const featureOptions = [
  { label: 'Caching', value: 'caching' },
  { label: 'Compression', value: 'compression' },
  { label: 'Encryption', value: 'encryption' },
  { label: 'Logging', value: 'logging' }
];
</script>
```

### Form Integration

```vue
<template>
  <Col>
    <Box :padding="2" color="cyan">
      <TextBox bold>User Preferences</TextBox>
    </Box>

    <Checkbox
      v-model="form.preferences"
      label="Notification channels:"
      :options="notificationOptions"
      :height="4"
      @change="onChange"
    />

    <Box :padding="1">
      <TextBox dim>Use arrow keys to navigate, Space to select</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { reactive } from 'vue';
import { Checkbox, Box, TextBox, Col } from 'vuetty';

const form = reactive({
  preferences: ['email']
});

const notificationOptions = [
  { label: 'Email Notifications', value: 'email' },
  { label: 'SMS Alerts', value: 'sms' },
  { label: 'Push Notifications', value: 'push' },
  { label: 'Weekly Digest', value: 'digest' }
];

const onChange = (newSelection) => {
  console.log('Preferences updated:', newSelection);
};
</script>
```

### Responsive Layout

```vue
<template>
  <Row>
    <Col :flex="1">
      <Checkbox
        v-model="selected"
        :options="options"
        label="Options:"
        :height="8"
        :width="30"
      />
    </Col>
    <Col :flex="2">
      <Box :padding="1">
        <TextBox>Details panel</TextBox>
      </Box>
    </Col>
  </Row>
</template>

<script setup>
import { ref } from 'vue';
import { Checkbox, Box, TextBox, Row, Col } from 'vuetty';

const selected = ref([]);
const options = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3', value: 'opt3' }
];
</script>
```
