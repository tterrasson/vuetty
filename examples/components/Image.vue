<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Image</TextBox>
    <Image :src="imagePath" :width="80" />
    <TextBox dim>Source: assets/sample.jpg</TextBox>
    <Image :src="imagePath" :height="10" :width="30" :preserveAspectRatio="false" />
  </Col>
</template>

<script setup>
import { fileURLToPath } from 'node:url';
import { Col, Image, TextBox } from 'vuetty';

const imagePath = fileURLToPath(new URL('../assets/sample.jpg', import.meta.url));
</script>
