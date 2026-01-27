<template>
  <Col :gap="1">
    <TextBox bold color="cyan">TextInput</TextBox>
    <TextInput
      v-model="query"
      color="green"
      placeholder="Search..."
      hint="Type to update the preview"
      multiline
    />
    <TextInput
      v-model="username"
      :width="24"
      placeholder="Username"
      :hint="false"
    />
    <Box :padding="1" borderStyle="round" color="gray">
      <TextBox dim>Current value:</TextBox>
      <TextBox>[{{ query }}]</TextBox>
    </Box>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Box, Col, TextBox, TextInput } from 'vuetty';

const query = ref('');
const username = ref('');
</script>
