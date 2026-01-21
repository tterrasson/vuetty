<template>
  <Col>
    <Row>
      <TextBox color="yellow" bold>
        Count: {{ count }}
      </TextBox>
    </Row>
    <Row>
      <TextInput
        v-model="inputValue"
        placeholder="0"
        @change="updateFromInput"
      />
    </Row>
    <Row>
      <Button
        label="Increment"
        variant="success"
        @click="increment"
      />
      <Button
        label="Decrement"
        variant="warning"
        @click="decrement"
      />
      <Button
        label="Reset"
        variant="danger"
        @click="reset"
      />
      <Col :padding="1">
        <Spinner v-if="isSyncing" label="Syncing" />
      </Col>
    </Row>

    <Row>
      <TextBox color="dim">
        Edit the input or click buttons to change value
      </TextBox>
    </Row>
  </Col>
</template>

<script setup>
import { ref, watch } from 'vue';
import {
  Box, Col, Row, TextBox, TextInput, Button, Spinner, Newline
} from 'vuetty';

const count = ref(0);
const inputValue = ref('0');
const isSyncing = ref(false);

// Sync inputValue when count changes from buttons
watch(count, (newCount) => {
  inputValue.value = String(newCount);
});

const updateFromInput = () => {
  const parsed = parseInt(inputValue.value, 10);
  if (!isNaN(parsed)) {
    count.value = parsed;
  } else {
    // Reset input to current count if invalid
    inputValue.value = String(count.value);
  }
};

const dummySync = () => {
  isSyncing.value = true;
  setTimeout(() => {
    isSyncing.value = false;
  }, 2000);
};

const increment = () => {
  count.value++;
  dummySync();
};

const decrement = () => {
  count.value--;
  dummySync();
};

const reset = () => {
  count.value = 0;
  dummySync();
};
</script>