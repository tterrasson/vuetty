<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Button</TextBox>

    <Row :gap="1">
      <Col>
        <Button label="Primary" variant="primary" @click="onClick" />
      </Col>
      <Col>
        <Button label="Secondary" variant="secondary" @click="onClick" />
      </Col>
      <Col>
        <Button label="Info" variant="info" @click="onClick" />
      </Col>
    </Row>

    <Row :gap="1">
      <Col>
        <Button label="Success" variant="success" @click="onClick" />
      </Col>
      <Col>
        <Button label="Warning" variant="warning" @click="onClick" />
      </Col>
      <Col>
        <Button label="Danger" variant="danger" @click="onClick" />
      </Col>
    </Row>

    <Row :gap="1">
      <Col>
        <Button label="Disabled" disabled @click="onClick" />
      </Col>
      <Col :flex="2">
        <Button label="Wide" fullWidth @click="onClick" />
      </Col>
    </Row>

    <Row :gap="1">
      <Col>
        <Button label="Custom" color="black" bold @click="onClick" />
      </Col>
    </Row>

    <TextBox color="cyan">Clicks: {{ count }}</TextBox>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Button, Col, Row, TextBox } from 'vuetty';

const count = ref(0);

const onClick = () => {
  count.value += 1;
};
</script>
