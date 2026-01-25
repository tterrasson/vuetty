# ProgressBar

The ProgressBar component visualizes operation progress with customizable styling, labels, and percentage display.

## Basic Usage

### Simple Progress Bar

```vue
<template>
  <Col>
    <ProgressBar
      :value="progress"
      :max="100"
      label="Download progress:"
      :width="40"
    />
  </Col>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ProgressBar, Col } from 'vuetty';

const progress = ref(0);

onMounted(() => {
  const interval = setInterval(() => {
    progress.value = Math.min(100, progress.value + 5);
    if (progress.value >= 100) {
      clearInterval(interval);
    }
  }, 200);
});
</script>
```

### Without Percentage

```vue
<template>
  <ProgressBar
    :value="65"
    :max="100"
    :show-percentage="false"
    label="Step 3 of 5"
    :width="30"
  />
</template>

<script setup>
import { ProgressBar } from 'vuetty';
</script>
```

### Custom Characters

```vue
<template>
  <Col>
    <ProgressBar
      :value="50"
      :max="100"
      char="▓"
      empty-char="░"
      label="Custom style:"
      :width="40"
      color="magenta"
    />
  </Col>
</template>

<script setup>
import { ProgressBar, Col } from 'vuetty';
</script>
```

## Props

### Progress

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Number` | `0` | Current progress value |
| `max` | `Number` | `100` | Maximum value for progress calculation |

### Display

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `Number \| String` | `null` | Width of the progress bar in characters |
| `char` | `String` | `'█'` | Character used for filled portion |
| `emptyChar` | `String` | `'░'` | Character used for empty portion |
| `showPercentage` | `Boolean` | `true` | Display percentage after the bar |
| `brackets` | `Boolean` | `true` | Display brackets around the progress bar |

### Labels

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | `''` | Label text displayed with the progress bar |
| `labelPosition` | `String` | `'left'` | Position of label: `'left'`, `'right'`, `'above'`, or `'below'` |

### Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `String` | `'green'` | Color for filled portion of the bar |
| `emptyColor` | `String` | `'white'` | Color for empty portion of the bar |
| `percentageColor` | `String` | `'white'` | Color for percentage text |
| `bold` | `Boolean` | `false` | Bold text for filled portion |
| `italic` | `Boolean` | `false` | Italic text |
| `underline` | `Boolean` | `false` | Underlined text |
| `dim` | `Boolean` | `false` | Dimmed text |

## Layout Props (Box Props)

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

## Advanced Examples

### Multiple Progress Bars

```vue
<template>
  <Col>
    <Box border :padding="2" color="cyan">
      <TextBox bold>Download Manager</TextBox>
    </Box>

    <ProgressBar
      :value="downloads.file1"
      :max="100"
      label="File 1 (image.png)"
      :width="35"
      color="green"
    />

    <ProgressBar
      :value="downloads.file2"
      :max="100"
      label="File 2 (document.pdf)"
      :width="35"
      color="yellow"
    />

    <ProgressBar
      :value="downloads.file3"
      :max="100"
      label="File 3 (archive.zip)"
      :width="35"
      color="magenta"
    />

    <Box :padding="1" margin-top="1">
      <TextBox dim>Total: {{ totalProgress.toFixed(0) }}%</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ProgressBar, Box, TextBox, Col } from 'vuetty';

const downloads = ref({
  file1: 0,
  file2: 0,
  file3: 0
});

const totalProgress = computed(() => {
  const sum = downloads.value.file1 + downloads.value.file2 + downloads.value.file3;
  return sum / 3;
});

onMounted(() => {
  const interval = setInterval(() => {
    downloads.value.file1 = Math.min(100, downloads.value.file1 + Math.random() * 5);
    downloads.value.file2 = Math.min(100, downloads.value.file2 + Math.random() * 3);
    downloads.value.file3 = Math.min(100, downloads.value.file3 + Math.random() * 4);

    if (totalProgress.value >= 100) {
      clearInterval(interval);
    }
  }, 200);
});
</script>
```

### Stacked Progress

```vue
<template>
  <Col>
    <ProgressBar
      :value="step1"
      :max="100"
      label="Step 1"
      :show-percentage="false"
      :width="40"
      color="green"
      :brackets="false"
    />

    <ProgressBar
      :value="step2"
      :max="100"
      label="Step 2"
      :show-percentage="false"
      :width="40"
      color="yellow"
      :brackets="false"
    />

    <ProgressBar
      :value="step3"
      :max="100"
      label="Step 3"
      :show-percentage="false"
      :width="40"
      color="magenta"
      :brackets="false"
    />

    <ProgressBar
      :value="overall"
      :max="100"
      label="Overall Progress"
      :width="40"
      color="cyan"
      bold
    />
  </Col>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ProgressBar, Col } from 'vuetty';

const step1 = ref(0);
const step2 = ref(0);
const step3 = ref(0);

const overall = computed(() => {
  const total = step1.value + step2.value + step3.value;
  return total / 3;
});

onMounted(() => {
  const interval = setInterval(() => {
    if (step1.value < 100) {
      step1.value += 2;
    } else if (step2.value < 100) {
      step2.value += 2;
    } else if (step3.value < 100) {
      step3.value += 2;
    } else {
      clearInterval(interval);
    }
  }, 100);
});
</script>
```

### Different Label Positions

```vue
<template>
  <Col>
    <Box :padding="1" color="magenta">
      <TextBox bold>Label Position Examples</TextBox>
    </Box>

    <!-- Label above -->
    <ProgressBar
      :value="50"
      :max="100"
      label="Above"
      label-position="above"
      :width="30"
      color="cyan"
    />

    <!-- Label below -->
    <ProgressBar
      :value="33"
      :max="100"
      label="Below"
      label-position="below"
      :width="30"
      color="green"
    />

    <!-- Label left (default) -->
    <ProgressBar
      :value="75"
      :max="100"
      label="Left"
      label-position="left"
      :width="30"
      color="yellow"
    />

    <!-- Label right -->
    <ProgressBar
      :value="66"
      :max="100"
      label="Right"
      label-position="right"
      :width="30"
      color="magenta"
    />
  </Col>
</template>

<script setup>
import { ProgressBar, Box, TextBox, Col } from 'vuetty';
</script>
```

### File Upload Simulation

```vue
<template>
  <Col>
    <Box border :padding="2" color="cyan">
      <TextBox bold>File Upload</TextBox>
    </Box>

    <Box :padding="1">
      <TextBox>Uploading: {{ fileName }}</TextBox>
      <ProgressBar
        :value="uploadProgress"
        :max="100"
        label="Progress"
        :width="40"
        color="green"
        bold
      />
      <TextBox dim>{{ fileSizeMB }}MB / {{ uploadedMB.toFixed(2) }}MB</TextBox>
    </Box>

    <Box v-if="uploadProgress >= 100" :padding="1" color="green">
      <TextBox bold color="white">✓ Upload complete!</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ProgressBar, Box, TextBox, Col } from 'vuetty';

const fileName = ref('presentation.pptx');
const fileSizeMB = ref(15.5);
const uploadProgress = ref(0);

const uploadedMB = computed(() => {
  return (uploadProgress.value / 100) * fileSizeMB.value;
});

onMounted(() => {
  const interval = setInterval(() => {
    uploadProgress.value = Math.min(100, uploadProgress.value + Math.random() * 3);

    if (uploadProgress.value >= 100) {
      clearInterval(interval);
    }
  }, 200);
});
</script>
```

### Custom Appearance

```vue
<template>
  <Col>
    <ProgressBar
      :value="value"
      :max="100"
      label="Modern Style"
      :width="35"
      char="━"
      empty-char="─"
      :brackets="false"
      color="cyan"
      bold
    />

    <ProgressBar
      :value="value"
      :max="100"
      label="Classic Style"
      :width="35"
      char="█"
      empty-char="░"
      :brackets="true"
      color="green"
    />

    <ProgressBar
      :value="value"
      :max="100"
      label="Minimal"
      :width="35"
      :show-percentage="false"
      :brackets="false"
      color="yellow"
      dim
    />

    <ProgressBar
      :value="value"
      :max="100"
      label="Retro"
      :width="35"
      char="▓"
      empty-char="░"
      color="magenta"
      label-position="right"
    />
  </Col>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ProgressBar, Col } from 'vuetty';

const value = ref(65);

onMounted(() => {
  setInterval(() => {
    value.value = Math.max(0, Math.min(100, value.value + Math.random() * 10 - 5));
  }, 500);
});
</script>
```

### Indeterminate Progress

```vue
<template>
  <Col>
    <ProgressBar
      :value="currentProgress"
      :max="100"
      label="Simulated indeterminate progress"
      :width="40"
      color="green"
    />
  </Col>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ProgressBar, Col } from 'vuetty';

const currentProgress = ref(0);

onMounted(() => {
  let direction = 1;

  setInterval(() => {
    currentProgress.value += direction * 2;

    if (currentProgress.value >= 90) {
      direction = -1;
    } else if (currentProgress.value <= 10) {
      direction = 1;
    }
  }, 50);
});
</script>
```
