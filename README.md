# Vuetty

A Vue.js custom renderer for building Terminal User Interfaces (TUIs). Vuetty brings Vue's reactive system and component model to the terminal, allowing you to build interactive command-line applications using familiar Vue.js syntax.

## Documentation

For detailed documentation, component references, and advanced usage, visit the [full documentation](https://github.com/tterrasson/vuetty).

## Features

- **Vue-Powered Reactivity**: Leverage Vue's reactive system to build dynamic terminal applications. State changes automatically trigger UI updates.
- **Comprehensive Component Library**: Pre-built components for layout, text, input, and data visualization.
- **Flexbox-Inspired Layouts**: Create sophisticated terminal layouts using familiar flexbox concepts with Row, Col, and flex ratio components.
- **Single File Component Support**: Develop with standard Vue SFC syntax using templates, scripts, and styles.
- **Color Theming Support**: Built-in support for color themes to style your terminal applications.
- **Advanced Input Management**: Built-in keyboard and mouse input handling with focus management and interactive form components.
- **Optimized Performance**: Efficient rendering with smart caching for text, images, and markdown content.

## Installation

```bash
bun add vuetty vue
```

## Quick Start

Create a simple Vue component:

```vue
<!-- Hello.vue -->
<template>
  <Box :padding="1" color="cyan">
    <TextBox bold>Hello, World!</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

Run it with Bun:

```js
// app.js
import 'vuetty/loader';
import { vuetty } from 'vuetty';
import Hello from './Hello.vue';

const app = vuetty(Hello);

process.on('SIGINT', () => {
  app.unmount();
  process.exit(0);
});
```

```bash
bun app.js
```

## Reactive Counter Example

```vue
<template>
  <Col>
    <Box :padding="1" color="cyan">
      <TextBox bold>Counter: {{ count }}</TextBox>
    </Box>
    <Box :padding="1" :color="countColor">
      <TextBox>{{ message }}</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Box, TextBox, Col } from 'vuetty';

const count = ref(0);
const countColor = computed(() => count.value > 10 ? 'red' : 'green');
const message = computed(() => count.value < 5 ? 'Just started...' : 'Getting high!');

onMounted(() => {
  setInterval(() => count.value++, 1000);
});
</script>
```

## Use Cases

Vuetty is designed for:

- CLI tools and interactive command-line applications
- Real-time monitoring dashboards for servers and services
- Development tools, debugging interfaces, and log viewers
- Data visualization with charts, graphs, and tables
- Form-based applications with validation

## License

MIT
