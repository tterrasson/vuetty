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
