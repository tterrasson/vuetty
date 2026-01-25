---
layout: home

hero:
  text: "Build Terminal UIs with Vue.js"
  tagline: A custom renderer that brings Vue's reactivity and component model to terminal applications
  image:
    src: /images/logo.webp
    alt: vuetty logo
  actions:
    - theme: brand
      text: Documentation
      link: /guide/getting-started/introduction
    - theme: alt
      text: Quick start
      link: /guide/getting-started/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/tterrasson/vuetty

features:
  - icon: ⚡
    title: Vue-Powered Reactivity
    details: Use Vue's reactive system to build dynamic terminal apps. State changes trigger UI updates in real time.

  - icon: 📦
    title: Comprehensive Component Library
    details: Use prebuilt components for layout, text, input, and data visualization in terminal interfaces.

  - icon: 🎨
    title: Flexbox-Inspired Layouts
    details: Build terminal layouts with familiar flexbox concepts, including Row, Col, and flex ratios.

  - icon: 📝
    title: Single File Component Support
    details: Develop with standard Vue SFC syntax—templates, scripts, and styles stay organized.

  - icon: ⌨️
    title: Advanced Input Management
    details: Handle keyboard and mouse input with focus management, event delegation, and interactive form components.

  - icon: 🚀
    title: Optimized Performance
    details: Render efficiently with caching for text, images, and markdown. Optimized viewport management keeps interactions smooth.
---

## Quick Example

Build reactive terminal interfaces with familiar Vue syntax:

::: code-group

```vue [Counter.vue]
<template>
  <Col>
    <Box color="cyan">
      Counter Example
    </Box>
    <Row>
      <TextBox color="green">Count: {{ counter }}</TextBox>
    </Row>
  </Col>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Box, TextBox, Row, Col } from 'vuetty';

const counter = ref(0);

onMounted(() => {
  setInterval(() => counter.value++, 1000);
});
</script>
```

```js [app.js]
import { vuetty } from 'vuetty';
import Counter from './Counter.vue';

// Create and mount the SFC component
const app = vuetty(Counter);

// Cleanup on exit
process.on('SIGINT', () => {
  app.unmount();
  process.exit(0);
});
```

:::

## Use Cases

Vuetty enables development of:

- **CLI Tools**: Build interactive command-line applications with rich user interfaces
- **Dashboard Applications**: Create real-time monitoring dashboards for servers and services
- **Development Tools**: Develop debugging interfaces, log viewers, and system administration utilities
- **Data Visualization**: Display charts, graphs, and tabular data directly in the terminal
- **Form-Based Applications**: Build complex forms with validation and interactive input handling

## Get Started

Start building terminal UIs with Vuetty:

<div style="margin-top: 20px;">
  <a href="/guide/getting-started/introduction.html" style="display: inline-block; padding: 12px 24px; background: var(--vp-button-brand-bg); color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">
    Read the Documentation
  </a>
</div>
