<template>
  <Col :gap="1">
    <Box :padding="1" borderStyle="double" color="cyan">
      <TextBox bold>Theme Carousel (switches every 2 seconds)</TextBox>
    </Box>

    <Row :gap="1">
      <Col :flex="2" :gap="1">
        <Box :padding="1" color="green">
          <TextBox>Current theme</TextBox>
          <TextBox bold color="yellow">{{ currentTheme }}</TextBox>
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

    <Row>
      <Spinner type="dots" label="Previewing theme" color="cyan" />
    </Row>

    <Box :padding="1" color="gray" borderStyle="dashed">
      <TextBox dim>Ctrl+C to exit</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  Box,
  Col,
  Divider,
  ProgressBar,
  Row,
  Spinner,
  TextBox,
  useTheme
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