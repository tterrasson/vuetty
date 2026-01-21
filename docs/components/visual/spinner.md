# Spinner

A self-animating loading indicator component that provides visual feedback for asynchronous operations. Supports multiple animation types, custom labels, and v-model control.

## Basic Usage

```vue
<template>
  <Col>
    <Spinner
      v-model="isLoading"
      type="dots"
      label="Fetching data..."
      :interval="100"
    />

    <Box v-if="!isLoading" :padding="1">
      <Text>Data loaded successfully!</Text>
    </Box>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Spinner, Box, Text, Col } from 'vuetty';

const isLoading = ref(true);

// Simulate an async operation
setTimeout(() => {
  isLoading.value = false;
}, 3000);
</script>
```

### Basic Spinner with Label

```vue
<template>
  <Spinner
    type="line"
    :frame="frame"
    label="Processing..."
    color="cyan"
    bold
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Spinner } from 'vuetty';

const frame = ref(0);

onMounted(() => {
  const interval = setInterval(() => {
    frame.value++;
  }, 80);

  // Cleanup when component unmounts
  onUnmounted(() => clearInterval(interval));
});
</script>
```

## Animation Types

The Spinner component supports 7 different animation types:

### dots

```vue
<Spinner type="dots" :frame="frame" label="Dots spinner" />
```
Frames: `⠋`, `⠙`, `⠹`, `⠸`, `⠼`, `⠴`, `⠦`, `⠧`, `⠇`, `⠏`

### line

```vue
<Spinner type="line" :frame="frame" label="Line spinner" />
```
Frames: `-`, `\`, `|`, `/`

### arc

```vue
<Spinner type="arc" :frame="frame" label="Arc spinner" />
```
Frames: `◐`, `◓`, `◑`, `◒`

### arrow

```vue
<Spinner type="arrow" :frame="frame" label="Arrow spinner" />
```
Frames: `▹`, `▸`, `▹`, `▸`

### bounce

```vue
<Spinner type="bounce" :frame="frame" label="Bounce spinner" />
```
Frames: `⠁`, `⠈`, `⠐`, `⠠`, `⢀`, `⡀`, `⠄`, `⠂`

### clock

```vue
<Spinner type="clock" :frame="frame" label="Clock spinner" />
```
Frames: `🕐`, `🕑`, `🕒`, `🕓`, `🕔`, `🕕`, `🕖`, `🕗`, `🕘`, `🕙`, `🕚`, `🕛`

### box

```vue
<Spinner type="box" :frame="frame" label="Box spinner" />
```
Frames: `▖`, `▘`, `▝`, `▗`

## Props

### Animation

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `String` | `'dots'` | Spinner animation type. Options: `'dots'`, `'line'`, `'arc'`, `'arrow'`, `'bounce'`, `'clock'`, `'box'` |
| `modelValue` | `Boolean` | `false` | Control animation state when using v-model. `true` starts animation, `false` stops it |
| `interval` | `Number` | `100` | Animation interval in milliseconds (must be greater than 0) |

### Display

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | `''` | Label text displayed next to the spinner |
| `labelPosition` | `String` | `'right'` | Position of label relative to spinner: `'left'` or `'right'` |

### Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `String` | `undefined` | Text color (supports named colors and hex codes) |
| `bold` | `Boolean` | `false` | Bold text |
| `italic` | `Boolean` | `false` | Italic text |
| `underline` | `Boolean` | `false` | Underlined text |
| `dim` | `Boolean` | `false` | Dimmed text |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitted when animation state could be updated (when using as controlled component) |

## Advanced Examples

### Multiple Spinners

```vue
<template>
  <Col>
    <Box :padding="2" color="cyan">
      <Text bold>Async Operation Status</Text>
    </Box>

    <Spinner
      v-model="isConnecting"
      type="dots"
      label="Connecting to server..."
      color="cyan"
      :interval="100"
    />

    <Spinner
      v-model="isAuthenticating"
      type="line"
      label="Authenticating..."
      color="yellow"
      :interval="80"
    />

    <Spinner
      v-model="isLoadingData"
      type="arc"
      label="Loading data..."
      color="green"
      :interval="120"
    />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Spinner, Box, Text, Col } from 'vuetty';

const isConnecting = ref(true);
const isAuthenticating = ref(false);
const isLoadingData = ref(false);

// Simulate multi-step async operation
setTimeout(() => {
  isConnecting.value = false;
  isAuthenticating.value = true;

  setTimeout(() => {
    isAuthenticating.value = false;
    isLoadingData.value = true;

    setTimeout(() => {
      isLoadingData.value = false;
    }, 2000);
  }, 1500);
}, 1000);
</script>
```

### Spinner Type Showcase

```vue
<template>
  <Col>
    <Box :padding="1" color="magenta">
      <Text bold>Available Spinner Types</Text>
    </Box>

    <Spinner type="dots" :frame="frame" label="dots" color="cyan" />
    <Spinner type="line" :frame="frame" label="line" color="green" />
    <Spinner type="arc" :frame="frame" label="arc" color="yellow" />
    <Spinner type="arrow" :frame="frame" label="arrow" color="red" />
    <Spinner type="bounce" :frame="frame" label="bounce" color="blue" />
    <Spinner type="clock" :frame="frame" label="clock" color="magenta" />
    <Spinner type="box" :frame="frame" label="box" color="white" />
  </Col>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Spinner, Box, Text, Col } from 'vuetty';

const frame = ref(0);

onMounted(() => {
  setInterval(() => {
    frame.value++;
  }, 100);
});
</script>
```

### Async Operation Wrapper

```vue
<template>
  <Col>
    <Spinner
      v-model="loading"
      type="dots"
      :label="loadingMessage"
      :interval="80"
      label-position="left"
      color="cyan"
      bold
    />

    <Box v-if="error" :padding="1" margin-top="1" color="red">
      <Text>{{ error }}</Text>
    </Box>

    <Box v-if="result" :padding="1" margin-top="1" color="green">
      <Text bold>Success: {{ result }}</Text>
    </Box>
  </Col>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Spinner, Box, Text, Col } from 'vuetty';

const loading = ref(false);
const loadingMessage = ref('Ready');
const error = ref(null);
const result = ref(null);

async function fetchData() {
  loading.value = true;
  error.value = null;
  result.value = null;

  loadingMessage.value = 'Connecting...';
  await delay(500);

  loadingMessage.value = 'Fetching data...';
  await delay(1000);

  loadingMessage.value = 'Processing...';
  await delay(800);

  try {
    result.value = 'Data loaded successfully';
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
    loadingMessage.value = 'Ready';
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

fetchData();
</script>
```

### Label Positioning

```vue
<template>
  <Col>
    <Spinner
      type="arrow"
      :frame="frame"
      label="Right position (default)"
      label-position="right"
      color="cyan"
    />

    <Spinner
      type="arrow"
      :frame="frame"
      label="Left position"
      label-position="left"
      color="green"
    />

    <Spinner
      type="dots"
      :frame="frame"
      label=""
      color="yellow"
    />
  </Col>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Spinner, Col } from 'vuetty';

const frame = ref(0);

onMounted(() => {
  setInterval(() => {
    frame.value++;
  }, 100);
});
</script>
```