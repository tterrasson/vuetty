<template>
  <Col :gap="1">
    <TextBox bold color="cyan">BigText</TextBox>
    <BigText font="Terrace" color="green">Vuetty</BigText>
    <BigText font="Stop" color="cyan">Big Text</BigText>
    <BigText font="Slant" align="center" color="yellow">Centered</BigText>
    <BigText font="Standard" color="white" bg="blue">Background</BigText>
  </Col>
</template>

<script setup>
import { BigText, Col, TextBox } from 'vuetty';
</script>
