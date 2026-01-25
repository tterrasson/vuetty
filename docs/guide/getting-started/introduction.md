# Introduction

## What is Vuetty?

Vuetty is a Vue.js custom renderer that brings Vue's reactivity to terminal UIs (TUIs). Build interactive command-line apps with the same Vue syntax and patterns you already use.

## Why Vuetty?

### Reactive Terminal UIs
Traditional terminal apps require manual screen management and complex state handling. With Vuetty, the UI updates automatically when state changes.

```js
const count = ref(0);
// When count changes, the terminal UI updates automatically!
```

### Familiar Development Experience
If you know Vue.js, you already know how to use Vuetty:
- Use `ref()`, `reactive()`, `computed()`, and `watch()`
- Write Single File Components (`.vue` files)
- Component composition and props
- All your favorite Vue patterns work in the terminal

### Modern Layout System
Vuetty uses flexbox principles for layout, so complex terminal UIs are straightforward:

```vue
<template>
  <Row>
    <Col :flex="1">
      <Box>Sidebar</Box>
    </Col>
    <Col :flex="3">
      <Box>Main Content</Box>
    </Col>
  </Row>
</template>
```

## Use Cases

Vuetty works well for:

- **CLI Tools** - Build feature-rich command-line interfaces
- **Development Tools** - Create interactive dev servers, build tools, and monitors
- **System Monitors** - Real-time dashboards for servers and applications
- **Data Visualization** - Terminal-based charts and tables
- **Interactive Forms** - User input collection with validation
- **Log Viewers** - Styled, filterable log displays
- **Games** - Terminal-based games with reactive updates

## How It Works

Vuetty implements a custom Vue renderer that targets the terminal instead of the DOM:

1. **[Custom Renderer](https://vuejs.org/api/custom-renderer.html)**: Translates Vue's virtual DOM operations into terminal operations
2. **[Yoga Layout Engine](https://www.yogalayout.dev)**: Provides precise flexbox layout calculations
3. **ANSI Rendering**: Uses ANSI escape codes for colors, styles, and positioning
4. **Input Management**: Handles keyboard input and focus management

You write Vue components, and Vuetty renders them in the terminal.

## Next Steps

Ready to start building? Continue to the [Quick Start](/guide/getting-started/quick-start) to set up Vuetty in your project.
