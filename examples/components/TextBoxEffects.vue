<template>
  <Col :gap="1">
    <TextBox bold color="cyan">TextBox with Effects</TextBox>

    <!-- Example 1: Animated Rainbow -->
    <TextBox bold underline>1. Rainbow</TextBox>
    <TextBox
      effect="rainbow"
      :animated="true"
      :effectProps="{ speed: 1 }"
    >
      Animated rainbow that scrolls!
    </TextBox>
    <TextBox
      effect="rainbow"
      :animated="true"
      :effectProps="{ speed: 2 }"
    >
      Faster rainbow
    </TextBox>

    <!-- Example 2: Animated Pulse -->
    <TextBox bold underline>2. Pulse</TextBox>
    <TextBox
      effect="pulse"
      :animated="true"
      :effectProps="{ color: '#00FFFF', minBrightness: 0.3, maxBrightness: 1.0 }"
    >
      Text that pulses in cyan
    </TextBox>
    <TextBox
      effect="pulse"
      :animated="true"
      :effectProps="{ color: '#FF6B35', minBrightness: 0.5 }"
      :animationInterval="100"
    >
      Slower orange pulse
    </TextBox>

    <!-- Example 3: Animated Wave -->
    <TextBox bold underline>3. Wave</TextBox>
    <TextBox
      effect="wave"
      :animated="true"
      :effectProps="{ colors: ['#00FFFF', '#FF00FF'], wavelength: 8, speed: 1 }"
    >
      Color wave that moves along the text
    </TextBox>

    <!-- Example 4: Animated Shimmer -->
    <TextBox bold underline>4. Shimmer</TextBox>
    <TextBox
      effect="shimmer"
      :animated="true"
      :effectProps="{
        baseColor: '#444444',
        highlightColor: '#FFFFFF',
        width: 5,
        speed: 1
      }"
    >
      Shimmering effect that moves
    </TextBox>
  </Col>
</template>

<script setup>
import { Col, Row, TextBox } from 'vuetty';
</script>
