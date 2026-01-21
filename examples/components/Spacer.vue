<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Spacer</TextBox>
    <Row>
      <TextBox>Left</TextBox>
      <Spacer :count="4" />
      <TextBox>Right</TextBox>
    </Row>
    <Row>
      <TextBox>Short</TextBox>
      <Spacer :count="10" />
      <TextBox>Gap</TextBox>
    </Row>
    <Row>
      <TextBox>Small</TextBox>
      <Spacer :count="2" />
      <TextBox>Gap</TextBox>
    </Row>
  </Col>
</template>

<script setup>
import { Col, Row, Spacer, TextBox } from 'vuetty';
</script>
