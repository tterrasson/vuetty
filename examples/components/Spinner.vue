<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Spinner</TextBox>
    <Row><Spinner type="dots" label="Loading" /></Row>
    <Row><Spinner type="line" label="Sync" /></Row>
    <Row><Spinner type="bounce" label="Wait" /></Row>
    <Row><Spinner type="arc" label="Arc" color="cyan" /></Row>
    <Row><Spinner type="clock" label="Clock" color="yellow" /></Row>
    <Row><Spinner type="box" label="Box" color="green" /></Row>
  </Col>
</template>

<script setup>
import { Col, Row, Spinner, TextBox } from 'vuetty';
</script>
