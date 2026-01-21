<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Tree</TextBox>
    <Tree :data="data" :indent="3" showIcons />
  </Col>
</template>

<script setup>
import { Col, TextBox, Tree } from 'vuetty';

const data = [
  {
    name: 'src',
    children: [
      {
        name: 'components',
        children: [{ name: 'Button.vue', color: 'green' }, { name: 'Table.vue', color: 'yellow' }]
      },
      { name: 'main.js', color: 'cyan' }
    ]
  },
  {
    name: 'tests',
    children: [{ name: 'ui.spec.js', color: 'magenta' }]
  }
];
</script>
