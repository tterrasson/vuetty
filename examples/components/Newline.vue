<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Newline</TextBox>
    <Box :padding="1" borderStyle="round" color="gray">
      <TextBox>Line 1</TextBox>
      <Newline />
      <TextBox>Line 3</TextBox>
      <Newline :count="2" />
      <TextBox>Line 6</TextBox>
      <Newline :count="3" />
      <TextBox dim>Line 10</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { Box, Col, Newline, TextBox } from 'vuetty';
</script>
