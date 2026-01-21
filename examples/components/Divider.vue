<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Divider</TextBox>
    <TextBox>Section A</TextBox>
    <Divider :length="50" color="gray" />
    <TextBox>Section B</TextBox>
    <Divider :length="50" char="-" color="cyan" />
    <TextBox>Section C</TextBox>
    <Divider :length="30" char="=" color="yellow" />
    <TextBox dim>Short separator</TextBox>
  </Col>
</template>

<script setup>
import { Col, Divider, TextBox } from 'vuetty';
</script>
