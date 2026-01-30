<template>
  <Col :gap="1">
    <Box :padding="1" borderStyle="double" color="cyan">
      <TextBox bold>Theme Carousel (switches every 2 seconds)</TextBox>
    </Box>

    <Row :gap="1">
      <Col :flex="2" :gap="1">
        <Box :padding="1" color="green">
          <TextBox>Current theme</TextBox>
          <TextBox bold>{{ currentTheme }}</TextBox>
          <TextBox dim>Next: {{ nextTheme }}</TextBox>
        </Box>
        <Box :padding="1" color="magenta">
          <TextBox>Cycle {{ currentIndex + 1 }} / {{ themes.length }}</TextBox>
          <ProgressBar :value="progress" :max="100" :width="28" label="Pulse" />
        </Box>
      </Col>

      <Col :flex="1" :gap="1">
        <Box :padding="1" color="cyan">
          <TextBox bold>Theme list</TextBox>
          <TextBox
            v-for="(theme, index) in themes"
            :key="theme"
            :color="theme === currentTheme ? 'yellow' : 'gray'"
            :bold="theme === currentTheme"
          >
            {{ index + 1 }}. {{ theme }}
          </TextBox>
        </Box>
      </Col>
    </Row>

    <Divider />

    <Row :gap="1">
      <Box :padding="1">
        <TextBox>Sample text</TextBox>
      </Box>
    </Row>

    <Row>
      <Spinner type="dots" label="Dots" :paddingLeft="2" />
      <Spinner type="line" label="Line" :paddingLeft="2" />
      <Spinner type="box" label="Box" :paddingLeft="2" />
    </Row>

    <Row :gap="1">
      <Checkbox v-model="selected1" :options="option1" label="Dark mode preference" />
      <Checkbox v-model="selected2" :options="option2" label="Auto-save" />
    </Row>

    <Box :padding="1" borderStyle="single">
      <Markdown :content="markdownContent" />
    </Box>

    <CodeDiff
      :oldCode="oldCode"
      :newCode="newCode"
      language="javascript"
      :showAll="true"
    />

    <Box :padding="1" borderStyle="dashed">
      <TextBox dim>Ctrl+C to exit</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  Box,
  Checkbox,
  Col,
  Divider,
  Markdown,
  ProgressBar,
  Row,
  Spinner,
  TextBox,
  useTheme,
  CodeDiff
} from 'vuetty';

const themes = [
  'AYU_DARK',
  'KANAGAWA_WAVE',
  'CATPPUCCIN_MOCHA',
  'NORD_DEFAULT',
  'TOKYO_NIGHT_STORM',
  'GRUVBOX_DARK',
  'AYU_MIRAGE',
  'ROSE_PINE_MOON',
  'SOLARIZED_DARK',
  'GITHUB_DARK'
];

const { setTheme } = useTheme();
const currentIndex = ref(0);
const currentTheme = ref(themes[0]);
const progress = ref(20);
const nextTheme = computed(
  () => themes[(currentIndex.value + 1) % themes.length]
);
const option1 = ref([
  { label: 'Dark', value: 'dark' },
  { label: 'Dark Grey', value: 'dark-grey' },
  { label: 'Light', value: 'light' }
]);
const selected1 = ref(["dark"])
const option2 = ref([
  { label: 'Force', value: 'force' },
  { label: 'Auto', value: 'auto' }
]);
const selected2 = ref(["auto"])
const markdownContent = `# Theme Preview

**Bold text** and *italic text* to see how they render.

- List item one
- List item two
- List item three

Example: \`const theme = useTheme()\` and regular text.

\`\`\`javascript
function applyTheme(name) {
  setTheme(name);
  return true;
}
\`\`\``;

const oldCode = `function greet(name) {
  console.log('Hello, ' + name);
  return name;
}

function add(a, b) {
  return a + b;
}

export { greet, add };`;

const newCode = `function greet(name, greeting = 'Hello') {
  const message = \`\${greeting}, \${name}!\`;
  console.log(message);
  return message;
}

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

export { greet, add, subtract };`;

let timerId = null;

const applyTheme = (index) => {
  const themeName = themes[index];
  currentTheme.value = themeName;
  setTheme(themeName);
};

onMounted(() => {
  applyTheme(currentIndex.value);
  timerId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % themes.length;
    applyTheme(currentIndex.value);
    progress.value = (progress.value + 11) % 101;
  }, 2000);
});

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId);
  }
});
</script>