# External Apps

Vuetty can temporarily hand terminal control to external command-line programs (editors, viewers, pagers) and restore your TUI when they exit.

## Basic Usage

Use the `runExternalApp` method on the Vuetty instance:

```vue
<script setup>
import { inject } from 'vue';
import { VUETTY_INSTANCE_KEY } from 'vuetty';

const vuetty = inject(VUETTY_INSTANCE_KEY, null);

const openEditor = () => {
  if (!vuetty) return;
  const result = vuetty.runExternalApp('vi', ['README.md']);

  if (result.error) {
    console.error('Failed to launch:', result.error.message);
  } else {
    console.log(`Exited with code ${result.status ?? result.exitCode}`);
  }
};
</script>
```

## API

### `vuetty.runExternalApp(command, args?, options?)`

Launches an external program and blocks the Vuetty event loop until it exits, then restores/redraws the TUI.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `command` | `string` | required | Executable name (e.g., `'vi'`, `'nano'`, `'less'`) |
| `args` | `string[]` | `[]` | Arguments passed to the executable |
| `options` | `object` | — | Optional configuration (see below) |

**Returns:** `{ status?: number, exitCode?: number, error?: Error }`

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `preserveAlternateBuffer` | `boolean` | `true` | Keeps the current alternate buffer and only clears/redraws around the external app. Set to `false` to fully exit/re-enter the alternate buffer during handoff. |

## Examples

### Open a file in vi

```vue
<script setup>
import { inject } from 'vue';
import { VUETTY_INSTANCE_KEY } from 'vuetty';

const vuetty = inject(VUETTY_INSTANCE_KEY, null);

const openVi = () => {
  vuetty?.runExternalApp('vi', ['README.md']);
};
</script>
```

### Open with arguments (less)

```vue
<script setup>
import { inject } from 'vue';
import { VUETTY_INSTANCE_KEY } from 'vuetty';

const vuetty = inject(VUETTY_INSTANCE_KEY, null);

const viewLog = () => {
  vuetty?.runExternalApp('less', ['logs/app.log']);
};
</script>
```

### Open nano

```vue
<script setup>
import { inject } from 'vue';
import { VUETTY_INSTANCE_KEY } from 'vuetty';

const vuetty = inject(VUETTY_INSTANCE_KEY, null);

const openNano = () => {
  vuetty?.runExternalApp('nano');
};
</script>
```

### Error handling

```vue
<script setup>
import { inject, ref } from 'vue';
import { VUETTY_INSTANCE_KEY } from 'vuetty';

const vuetty = inject(VUETTY_INSTANCE_KEY, null);
const status = ref('Ready');

const open = (command, args = []) => {
  status.value = `Opening ${command}...`;

  try {
    const result = vuetty.runExternalApp(command, args);

    if (result.error) {
      status.value = `Failed to launch ${command}: ${result.error.message}`;
    } else {
      const code = result.status ?? result.exitCode;
      status.value = code === 0
        ? `Returned from ${command}.`
        : `${command} exited with code ${code}.`;
    }
  } catch (error) {
    status.value = `Failed to launch ${command}: ${error.message}`;
  }
};
</script>
```

## Common Patterns

### Button-triggered editor

```vue
<template>
  <Col :gap="1">
    <TextBox bold color="cyan">External Editor Handoff</TextBox>
    <TextBox dim>Press Enter on a button (or click) to open an external app.</TextBox>

    <Row :gap="2">
      <Button label="Open vi" variant="primary" @click="open('vi')" />
      <Button label="Open nano" variant="primary" @click="open('nano')" />
      <Button label="Open less" variant="primary" @click="open('less', ['README.md'])" />
      <Button label="Open non-existing" variant="secondary" @click="open('__vuetty_nonexistent__')" />
    </Row>

    <TextBox color="green">Status: {{ status }}</TextBox>
    <TextBox dim>Quit: vi → :q · nano → Ctrl+X · less → q</TextBox>
  </Col>
</template>

<script setup>
import { inject, ref } from 'vue';
import { Button, Col, Row, TextBox, VUETTY_INSTANCE_KEY } from 'vuetty';

const vuetty = inject(VUETTY_INSTANCE_KEY, null);
const status = ref('Ready');

const open = (command, args = []) => {
  status.value = `Opening ${command}...`;

  try {
    const result = vuetty.runExternalApp(command, args);

    if (result.error) {
      status.value = `Failed to launch ${command}: ${result.error.message}`;
    } else {
      const code = result.status ?? result.exitCode;
      status.value = code === 0
        ? `Returned from ${command}.`
        : `${command} exited with code ${code}.`;
    }
  } catch (error) {
    status.value = `Failed to launch ${command}: ${error.message}`;
  }
};
</script>
```

## Notes

- External apps run in the terminal's **alternate screen buffer** by default, so the TUI is restored cleanly when the app exits.
- Common quit sequences: `vi` → `:q`, `nano` → `Ctrl+X`, `less` → `q`.
- If the command is not found, `runExternalApp` returns an error object instead of throwing.
