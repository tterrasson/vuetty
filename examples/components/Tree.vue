<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Tree Component Examples</TextBox>

    <!-- Default style with icons -->
    <Row>
      <TextBox bold>Default Style (with icons)</TextBox>
    </Row>
    <Row>
      <Tree :data="data" :indent="3" showIcons />
    </Row>

    <!-- Bold style -->
    <Row>
      <TextBox bold>Bold Style</TextBox>
    </Row>
    <Row>
      <Tree :data="data" treeStyle="bold" branchColor="cyan" />
    </Row>

    <!-- Double style -->
    <Row>
      <TextBox bold>Double Style</TextBox>
    </Row>
    <Row>
      <Tree :data="data" treeStyle="double" branchColor="magenta" />
    </Row>

    <!-- Classic ASCII style -->
    <Row>
      <TextBox bold>Classic ASCII Style</TextBox>
    </Row>
    <Row>
      <Tree :data="data" treeStyle="classic" branchColor="yellow" />
    </Row>

    <!-- Custom style -->
    <Row>
      <TextBox bold>Custom Style</TextBox>
    </Row>
    <Row>
      <Tree :data="data" :treeStyle="customStyle" branchColor="green" />
    </Row>
  </Col>
</template>

<script setup>
import { Col, Row, TextBox, Tree } from 'vuetty';

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

const customStyle = {
  branch: '▸',
  last: '▹',
  vertical: '┊',
  horizontal: '─'
};
</script>
