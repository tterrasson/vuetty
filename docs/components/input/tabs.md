# Tabs

The Tabs component provides tabbed navigation with an optional panel area. It supports v-model, keyboard and mouse navigation, and flexible tab definitions.

## Basic Usage

```vue
<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Tabs</TextBox>

    <Tabs v-model="activeTab" :tabs="tabs">
      <template #default="{ activeTab }">
        <TextBox v-if="activeTab === 'general'">
          General settings panel content.
        </TextBox>
        <TextBox v-else-if="activeTab === 'advanced'" color="yellow">
          Advanced settings panel content.
        </TextBox>
        <TextBox v-else color="green">
          About panel content.
        </TextBox>
      </template>
    </Tabs>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, Tabs, TextBox } from 'vuetty';

const tabs = [
  { value: 'general', label: 'General' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'about', label: 'About' },
  { value: 'disabled', label: 'Disabled', disabled: true }
];

const activeTab = ref('general');
</script>
```

<!-- Video placeholder: tabs-navigation.mp4 - Shows keyboard and mouse navigation -->
*Tabbed navigation with panel content*

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \\| number` | `null` | Active tab value (v-model). Defaults to first enabled tab when `null` |
| `tabs` | `array` | `[]` | List of tabs (required) |
| `width` | `number` | `undefined` | Panel width in characters |
| `disabled` | `boolean` | `false` | Disable navigation and selection |
| `color` | `string` | `-` | Base text color ([chalk color names](https://github.com/chalk/chalk?tab=readme-ov-file#styles)) |
| `bg` | `string` | `-` | Background color |
| `focusColor` | `string` | `'cyan'` | Border color when focused |
| `activeColor` | `string` | `'green'` | Color for the active tab label and underline |
| `highlightColor` | `string` | `'yellow'` | Color for the highlighted tab (keyboard focus) |
| `panelBorder` | `boolean` | `true` | Show a panel border under the tab bar |
| `panelBorderStyle` | `string \\| object` | `'rounded'` | Panel border style (same styles as Box) |
| `panelPadding` | `number` | `1` | Panel padding (characters) |
| `hint` | `string \\| boolean` | `'default'` | Hint text when focused (`false` to hide) |
| `flex` | `number \\| string` | `undefined` | Flex layout shorthand |
| `flexGrow` | `number` | `undefined` | Flex grow factor |
| `flexShrink` | `number` | `undefined` | Flex shrink factor |
| `flexBasis` | `number \\| string` | `undefined` | Flex basis value |

## Tabs Format

Tabs can be objects or primitive values:

```js
// Object format (recommended)
{
  value: 'general',  // value used by v-model
  label: 'General',  // display label
  disabled: false    // optional
}

// Primitive format (label derived from value)
'Profile'
42
```

## Panel Content (Default Slot)

The default slot receives `{ activeTab }`, letting you render content based on the active tab.

```vue
<Tabs v-model="activeTab" :tabs="tabs">
  <template #default="{ activeTab }">
    <TextBox>Active: {{ activeTab }}</TextBox>
  </template>
</Tabs>
```

## Keyboard & Mouse

- Arrow keys: move between tabs
- Home/End: jump to first/last tab
- Enter/Space: select highlighted tab
- Type a letter: jump to the next tab starting with that letter
- Mouse click: select a tab

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `value` | Emitted when a tab is selected |
| `change` | `value` | Emitted when the selected tab changes |
| `focus` | `-` | Emitted when the component gains focus |
| `blur` | `-` | Emitted when the component loses focus |

## Examples

### No Panel Border

```vue
<template>
  <Tabs v-model="activeTab" :tabs="tabs" :panelBorder="false" :panelPadding="0">
    <template #default="{ activeTab }">
      <TextBox>Content for: {{ activeTab }}</TextBox>
    </template>
  </Tabs>
</template>

<script setup>
import { ref } from 'vue';
import { Tabs, TextBox } from 'vuetty';

const tabs = ['Home', 'Profile', 'Settings'];
const activeTab = ref('Home');
</script>
```

### Custom Colors

```vue
<template>
  <Tabs
    v-model="activeTab"
    :tabs="tabs"
    activeColor="magenta"
    highlightColor="cyan"
    focusColor="yellow"
  />
</template>

<script setup>
import { ref } from 'vue';
import { Tabs } from 'vuetty';

const tabs = ['Overview', 'Metrics', 'Logs'];
const activeTab = ref('Overview');
</script>
```

## Usage with Other Components

Tabs pair well with layout and content components:

```vue
<template>
  <Col :gap="1">
    <TextBox bold>Settings</TextBox>
    <Tabs v-model="activeTab" :tabs="tabs">
      <template #default="{ activeTab }">
        <Box :padding="1">
          <TextBox>Section: {{ activeTab }}</TextBox>
        </Box>
      </template>
    </Tabs>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Box, Col, Tabs, TextBox } from 'vuetty';

const tabs = ['General', 'Advanced', 'About'];
const activeTab = ref('General');
</script>
```
