<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Radiobox</TextBox>
    <Radiobox v-model="selected" :options="options" :height="6" />
    <TextBox color="green">Selected: {{ selected }}</TextBox>
    <Radiobox
      v-model="theme"
      label="Theme:"
      direction="horizontal"
      :options="themes"
    />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, Radiobox, TextBox } from 'vuetty';

const options = [
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg', disabled: true }
];

const selected = ref('md');

const themes = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Auto', value: 'auto' }
];

const theme = ref('auto');
</script>
