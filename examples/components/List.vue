<template>
  <Col :gap="1">
    <TextBox bold color="cyan">List Component (Static Display)</TextBox>

    <TextBox bold>Simple string list:</TextBox>
    <List :items="fruits" :height="5" />

    <TextBox bold>Highlighted status:</TextBox>
    <List
      label="Build Pipeline:"
      :items="pipelineSteps"
      :highlightedValue="currentStep"
      highlightColor="green"
      marker="→"
    />
    <TextBox color="green">Current step: {{ currentStep }}</TextBox>

    <TextBox bold>Object list with custom markers:</TextBox>
    <List
      label="Available Sizes:"
      :items="sizes"
      marker="•"
      :height="4"
    />

    <TextBox bold>Display logs (limited height):</TextBox>
    <List
      :items="logs"
      :height="6"
      color="gray"
      dim
    />

    <TextBox dim>Note: List is static. For interactive selection, use SelectInput.</TextBox>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, List, TextBox } from 'vuetty';

const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];

const pipelineSteps = [
  { value: 'build', label: 'Build' },
  { value: 'test', label: 'Test' },
  { value: 'deploy', label: 'Deploy' },
  { value: 'verify', label: 'Verify' }
];
const currentStep = ref('test');

const sizes = [
  { value: 'xs', label: 'Extra Small' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' }
];

const logs = [
  'Server started on port 3000',
  'Database connection established',
  'API endpoints registered',
  'Middleware configured',
  'WebSocket server initialized',
  'Cache service connected',
  'Background jobs scheduled',
  'Application ready to accept requests',
  'Health check endpoint active',
  'Metrics collection started'
];
</script>
