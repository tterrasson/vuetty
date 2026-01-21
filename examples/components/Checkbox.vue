<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Checkbox</TextBox>
    <Checkbox v-model="selected" :options="options" :height="6" />
    <TextBox color="green">Selected: {{ selected.join(', ') }}</TextBox>
    <Checkbox
      v-model="notify"
      direction="horizontal"
      label="Notify:"
      :options="notifyOptions"
    />
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Checkbox, Col, TextBox } from 'vuetty';

const options = [
  { label: 'Build', value: 'build' },
  { label: 'Test', value: 'test' },
  { label: 'Deploy', value: 'deploy', disabled: true },
  { label: 'Notify', value: 'notify' }
];

const selected = ref(['build', 'test']);

const notifyOptions = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Push', value: 'push' }
];

const notify = ref(['email']);
</script>
