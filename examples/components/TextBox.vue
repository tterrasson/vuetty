<template>
  <Col :gap="1">
    <TextBox bold color="cyan">TextBox</TextBox>
    <TextBox>Regular text output.</TextBox>
    <TextBox bold>Bold text.</TextBox>
    <TextBox italic>Italic text.</TextBox>
    <TextBox dim>Dim text.</TextBox>
    <TextBox color="green">Colored text.</TextBox>
    <TextBox underline>Underlined text.</TextBox>
    <TextBox bg="blue" color="white">Background color.</TextBox>
  </Col>
</template>

<script setup>
import { Col, TextBox } from 'vuetty';
</script>
