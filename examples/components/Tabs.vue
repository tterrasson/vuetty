<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Tabs Component</TextBox>

    <Tabs v-model="activeTab" :tabs="tabs">
      <template #default="{ activeTab }">
        <TextBox v-if="activeTab === 'general'" color="white">
          General settings panel content.
          Configure your basic preferences here.
        </TextBox>
        <TextBox v-else-if="activeTab === 'advanced'" color="yellow">
          Advanced settings panel.
          Fine-tune your configuration options.
        </TextBox>
        <TextBox v-else-if="activeTab === 'about'" color="green">
          About this application.
          Version 1.0.0 - Made with Vuetty
        </TextBox>
      </template>
    </Tabs>

    <TextBox color="magenta">Active tab: {{ activeTab }}</TextBox>

    <Divider />

    <TextBox bold color="cyan">Tabs without panel border</TextBox>

    <Tabs v-model="tab2" :tabs="simpleTabs" :panelBorder="false" :panelPadding="0">
      <template #default="{ activeTab }">
        <TextBox>Content for: {{ activeTab }}</TextBox>
      </template>
    </Tabs>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, Tabs, TextBox, Divider } from 'vuetty';

const tabs = [
  { value: 'general', label: 'General' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'about', label: 'About' },
  { value: 'disabled', label: 'Disabled', disabled: true }
];

const activeTab = ref('general');

const simpleTabs = ['Home', 'Profile', 'Settings'];
const tab2 = ref('Home');
</script>
