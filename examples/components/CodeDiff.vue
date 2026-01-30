<template>
  <Col :gap="1">
    <TextBox bold color="cyan">CodeDiff - Inline Mode</TextBox>
    <CodeDiff
      :oldCode="oldCode"
      :newCode="newCode"
      language="javascript"
      :context="3"
    />

    <Spacer :height="1" />

    <TextBox bold color="cyan">CodeDiff - Side by Side</TextBox>
    <CodeDiff
      :oldCode="oldCode"
      :newCode="newCode"
      language="javascript"
      mode="side-by-side"
      :context="3"
    />

    <Spacer :height="1" />

    <TextBox bold color="cyan">CodeDiff - Show All Lines</TextBox>
    <CodeDiff
      :oldCode="oldCode"
      :newCode="newCode"
      language="javascript"
      :showAll="true"
    />
  </Col>
</template>

<script setup>
import { Col, CodeDiff, TextBox, Spacer } from 'vuetty';

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
</script>
