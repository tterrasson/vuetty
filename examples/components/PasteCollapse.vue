<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Paste Collapse</TextBox>
    <TextBox dim>Paste a large block of text — it collapses to a compact token in the input while the real content appears in the preview below.</TextBox>

    <Markdown :content="preview" />

    <TextInput
      v-model="message"
      multiline
      placeholder="Type or paste text here..."
      hint="Paste large text to see it collapse · Enter to submit"
    />
  </Col>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Col, Markdown, TextBox, TextInput } from 'vuetty';

const message = ref('');

const preview = computed(() =>
  message.value.trim()
    ? message.value
    : '_No content yet — type or paste something._'
);
</script>
