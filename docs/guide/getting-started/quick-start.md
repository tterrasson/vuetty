# Quick Start

This quick start uses the repository's `simple-app-example` as the base for a minimal Vuetty app. You'll clone the repo, copy the example, run it, then trim it to the essentials.

## 1) Clone the repo and copy the example

```bash
git clone https://github.com/tterrasson/vuetty
cd vuetty
cp -a simple-app-example my-vuetty-app
cd my-vuetty-app
```

## 2) Install dependencies

```bash
bun install
```

## 3) Run the example

```bash
bun run dev
```

You should see the example UI in your terminal. Press `Ctrl+C` to stop it.

## 4) Create a minimal app

The example already includes the runtime setup in `src/index.js`. Keep that file and replace the page with a minimal component.

Open `src/pages/App.vue` and replace its contents with:

```vue
<template>
  <Box :padding="1" color="cyan">
    <TextBox>Hello from Vuetty</TextBox>
  </Box>
</template>

<script setup>
import { Box, TextBox } from 'vuetty';
</script>
```

Run it again:

```bash
bun run dev
```

You now have a minimal working Vuetty app: one component, one box, one line of text.

## 5) What this example gives you

- `src/index.js` bootstraps Vuetty, mounts the app, and handles shutdown.
- `src/pages/App.vue` is your main page (now minimal).
- `src/components/` is where you can add more UI pieces as your app grows.

## Next in the docs

- Learn about the debug server: [Debug Server](./debug-server.md)
- Theming and colors: [Theming](../theming/index.md) and [Colors](../theming/colors.md)
