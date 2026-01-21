<template>
  <Col :gap="1">
    <TextBox bold color="cyan">ProgressBar</TextBox>
    <ProgressBar :value="progress" :max="100" :width="40" label="Build" />
    <ProgressBar :value="secondary" :max="100" :width="40" label="Tests" color="yellow" />
    <ProgressBar
      :value="secondary"
      :max="100"
      :width="40"
      label="Step 2/4"
      :show-percentage="false"
      char="#"
      empty-char="."
      color="green"
    />
  </Col>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { Col, ProgressBar, TextBox } from 'vuetty';

const progress = ref(10);
const secondary = ref(45);
let timerId = null;

onMounted(() => {
  timerId = setInterval(() => {
    progress.value = (progress.value + 4) % 101;
    secondary.value = (secondary.value + 2) % 101;
  }, 200);
});

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId);
  }
});
</script>
