<template>
  <Col>
    <Header />
    <Row>
      <Box title="Welcome" :padding="1">
        <TextBox color="cyan">
          Welcome to Vuetty - A Vue 3 framework for Terminal UIs!
        </TextBox>
        <Newline />
        <TextBox color="gray">
          This is a minimal barebone starter application.
        </TextBox>
      </Box>
    </Row>

    <Row>
      <Counter />
    </Row>

    <TextDemo />

    <Row>
      <TextBox color="dim">
        Press Ctrl+C to exit
      </TextBox>
    </Row>
  </Col>
</template>

<script setup>
import Header from '@components/Header.vue';
import Counter from '@components/Counter.vue';
import TextDemo from '@components/TextDemo.vue';
import { Col, Row, Newline, Box, TextBox } from 'vuetty';
</script>
