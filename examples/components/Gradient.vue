<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Gradient</TextBox>
    <Gradient name="ocean">
      <TextBox bold>Ocean preset gradient</TextBox>
    </Gradient>
    <Gradient :colors="['#ff6b6b', '#feca57', '#1dd1a1']">
      <TextBox bold>Custom colors</TextBox>
    </Gradient>
    <Gradient name="sunset">
      <TextBox bold>Sunset preset</TextBox>
    </Gradient>
    <Gradient name="rainbow" interpolation="hsv">
      <TextBox bold>Rainbow (hsv)</TextBox>
    </Gradient>
  </Col>
</template>

<script setup>
import { Col, Gradient, TextBox } from 'vuetty';
</script>
