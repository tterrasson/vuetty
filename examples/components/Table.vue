<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Table</TextBox>
    <Table
      v-model="selectedIndex"
      label="Team Status"
      :headers="headers"
      :rows="rows"
      :height="7"
    />
    <TextBox color="green">Selected row: {{ selectedLabel }}</TextBox>
    <Table
      :headers="headers"
      :rows="rows"
      :height="4"
      :striped="false"
      :showHeader="false"
      :hint="false"
    />
  </Col>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Col, Table, TextBox } from 'vuetty';

const headers = ['Name', 'Role', 'Status'];
const rows = [
  ['Ada', 'Engineer', 'Active'],
  ['Bruno', 'Designer', 'Idle'],
  ['Cleo', 'PM', 'Active'],
  ['Dee', 'QA', 'Blocked'],
  ['Evan', 'Ops', 'Active']
];

const selectedIndex = ref(0);
const selectedLabel = computed(() => {
  const row = rows[selectedIndex.value];
  return row ? `${row[0]} (${row[1]})` : 'None';
});
</script>
