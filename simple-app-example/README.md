# Create Vuetty App

A minimal barebone starter application for building Terminal User Interfaces (TUI) with Vue 3 and Vuetty.

## Features

- **Vue 3** - Modern reactive framework with Composition API
- **Vuetty** - Vue 3 framework for terminal UIs
- **Pinia** - State management
- **Bun** - Fast JavaScript runtime and bundler
- **Rollup** - Module bundler for production builds

## Project Structure

```
create-vuetty-app/
├── src/
│   ├── index.js           # Application entry point
│   ├── pages/
│   │   └── App.vue        # Main application component
│   └── components/
│       ├── Header.vue     # Header with ASCII art title
│       ├── Counter.vue    # Interactive counter demo
│       └── TextDemo.vue   # Text styling examples
├── package.json           # Dependencies and scripts
├── rollup.config.js       # Production build configuration
├── bunfig.dev.toml       # Bun development configuration
└── jsconfig.json          # Path aliases configuration
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your system

### Installation

1. Install dependencies:

```bash
bun install
```

### Development

Run the application in development mode:

```bash
bun run dev
```

### Building

Build the application for production:

```bash
bun run build
```

This creates a bundled `dist/bundle.js` file.

### Running Production Build

After building, run the production bundle:

```bash
bun run start
```

### Cleaning

Remove build artifacts:

```bash
bun run clean
```

## Vuetty Components

This starter includes examples of commonly used Vuetty components:

- **Layout**: `Col`, `Row`, `Box`
- **Text**: `TextBox`, `BigText`, `Gradient`
- **UI**: `Spinner`, `Newline`

See the [Vuetty documentation](../README.md) for the full list of available components.

## Customization

### Adding New Components

1. Create a new `.vue` file in `src/components/`
2. Import and use it in `src/pages/App.vue`

### Path Aliases

The following path aliases are configured:

- `@` → `src/`
- `@pages` → `src/pages/`
- `@components` → `src/components/`

Example:
```javascript
import Header from '@components/Header.vue';
```

### Adding State Management

Pinia is already configured. To add a store:

1. Create `src/stores/` directory
2. Add your store file (e.g., `counter.js`)
3. Import and use in your components

Example store:
```javascript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);

  function increment() {
    count.value++;
  }

  return { count, increment };
});
```

## Build System

### Development (Bun)

- Uses `bunfig.dev.toml` to preload `vuetty/bun-loader`
- Fast startup and execution

### Production (Rollup)

- Bundles all source files into a single `dist/bundle.js`
- Uses `vuettyPlugin()` to transform `.vue` files
- Externalizes Vue, Pinia, and Vuetty for smaller bundles
- Generates source maps for debugging

## Tips

- Press **Ctrl+C** to exit the application
- Enable the Vuetty debug server (already enabled) for development tools
- Keep components simple and focused on terminal rendering
- Use Vuetty's built-in components instead of HTML elements

## Next Steps

- Add keyboard input handling with Vuetty's input components
- Implement navigation between different views/pages
- Add more complex layouts and interactions
- Integrate with external APIs or data sources