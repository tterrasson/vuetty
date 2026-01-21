<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Row</TextBox>

    <TextBox dim>Flex distribution with Col children.</TextBox>
    <Row :gap="1">
      <Col :flex="1">
        <Box :padding="1" color="green">
          <TextBox>flex=1</TextBox>
        </Box>
      </Col>
      <Col :flex="2">
        <Box :padding="1" color="blue">
          <TextBox>flex=2</TextBox>
        </Box>
      </Col>
      <Col :flex="1">
        <Box :padding="1" color="magenta">
          <TextBox>flex=1</TextBox>
        </Box>
      </Col>
    </Row>

    <TextBox dim>justifyContent="space-between"</TextBox>
    <Row justifyContent="space-between">
      <Box :padding="1" color="yellow">
        <TextBox>A</TextBox>
      </Box>
      <Box :padding="1" color="cyan">
        <TextBox>B</TextBox>
      </Box>
      <Box :padding="1" color="green">
        <TextBox>C</TextBox>
      </Box>
    </Row>

    <TextBox dim>flexWrap="wrap" with width=30</TextBox>
    <Row :width="30" flexWrap="wrap" :gap="1">
      <Box :padding="1" color="cyan">
        <TextBox>One</TextBox>
      </Box>
      <Box :padding="1" color="green">
        <TextBox>Two</TextBox>
      </Box>
      <Box :padding="1" color="magenta">
        <TextBox>Three</TextBox>
      </Box>
      <Box :padding="1" color="blue">
        <TextBox>Four</TextBox>
      </Box>
    </Row>
  </Col>
</template>

<script setup>
import { Box, Col, Row, TextBox } from 'vuetty';
</script>
