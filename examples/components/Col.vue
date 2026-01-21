<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Col</TextBox>
    <TextBox dim>Vertical stacking with flex ratios.</TextBox>

    <Col :height="12" :gap="1">
      <Box :flex="1" :padding="1" color="green">
        <TextBox>flex=1</TextBox>
      </Box>
      <Box :flex="2" :padding="1" color="blue">
        <TextBox>flex=2</TextBox>
      </Box>
      <Box :flex="1" :padding="1" color="magenta">
        <TextBox>flex=1</TextBox>
      </Box>
    </Col>

    <TextBox dim>justifyContent="space-between"</TextBox>
    <Col :height="10" justifyContent="space-between">
      <Box :padding="1" color="cyan">
        <TextBox>Top</TextBox>
      </Box>
      <Box :padding="1" color="yellow">
        <TextBox>Bottom</TextBox>
      </Box>
    </Col>
  </Col>
</template>

<script setup>
import { Box, Col, TextBox } from 'vuetty';
</script>
