<template>
  <Col :gap="1">
    <Box :padding="1" color="cyan" borderStyle="round">
      <TextBox bold>Box</TextBox>
      <TextBox dim>Container with border and padding.</TextBox>
    </Box>

    <Row :gap="1">
      <Box :padding="1" color="green" borderStyle="single">
        <TextBox>Compact</TextBox>
      </Box>
      <Box :padding="2" color="magenta" borderStyle="double">
        <TextBox>Spacious</TextBox>
      </Box>
    </Row>

    <Box :padding="1" color="yellow" borderStyle="dashed">
      <TextBox>Nested box</TextBox>
      <Box :padding="1" color="cyan" borderStyle="round">
        <TextBox dim>Inner content</TextBox>
      </Box>
    </Box>
  </Col>
</template>

<script setup>
import { Box, Col, Row, TextBox } from 'vuetty';
</script>
