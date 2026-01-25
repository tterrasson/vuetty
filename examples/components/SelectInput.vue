<template>
  <Col :gap="1">
    <TextBox bold color="cyan">SelectInput - Single Selection</TextBox>
    <SelectInput v-model="selected" label="Pick one" :options="options" :height="3" />
    <TextBox color="green">Selected: {{ selected }}</TextBox>

    <TextBox bold color="cyan">SelectInput - Multi Selection</TextBox>
    <SelectInput v-model="selectedMultiple" label="Pick multiple" :options="options" :height="5" multiple />
    <TextBox color="green">Selected: {{ selectedMultiple.join(', ') }}</TextBox>

    <SelectInput v-model="role" label="Role" :options="roleOptions" :height="4" />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, SelectInput, TextBox } from 'vuetty';

const options = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
  { label: 'Gamma', value: 'gamma' },
  { label: 'Delta', value: 'delta' },
  { label: 'Epsilon', value: 'epsilon' }
];

const selected = ref('beta');
const selectedMultiple = ref(['alpha', 'gamma']);

const roleOptions = [
  { label: 'Admin', value: 'admin', disabled: true },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' }
];

const role = ref('viewer');
</script>
