<template>
  <Col :gap="1">
    <TextBox bold color="cyan">VirtualList Lazy Feed</TextBox>
    <TextBox dim>
      Items are appended every 350ms. Focus the list and use ↑/↓, PageUp/PageDown, Home/End, or the mouse wheel.
    </TextBox>

    <VirtualList
      :count="logs.length"
      :height="12"
      :getItem="getLog"
      :overscan="4"
      :cacheBuffer="8"
      :maxItems="40"
      autoScrollToBottom
      focusColor="yellow"
      loadingText="Loading log..."
      emptyText="Waiting for logs..."
      @scroll="onScroll"
      @prune="onPrune"
    >
      <template #default="{ item, index, loading }">
        <TextBox
          :color="loading ? 'gray' : levelColor(item.level)"
          :dim="loading"
        >
          {{ loading ? 'Loading log...' : formatLog(item, index) }}
        </TextBox>
      </template>
    </VirtualList>

    <Row :gap="2">
      <TextBox color="green">Kept: {{ logs.length }}</TextBox>
      <TextBox color="gray">Dropped: {{ droppedCount }}</TextBox>
      <TextBox color="yellow">Window: {{ scrollStart }}-{{ scrollEnd }}</TextBox>
      <TextBox dim>Cache stays bounded while the feed grows.</TextBox>
    </Row>
  </Col>
</template>

<script setup>
import { onUnmounted, ref } from 'vue';
import { Col, Row, TextBox, VirtualList } from 'vuetty';

const levels = ['info', 'debug', 'warn', 'error'];
const logs = ref([]);
const scrollStart = ref(0);
const scrollEnd = ref(0);
const droppedCount = ref(0);
let tick = 0;

function createLog(index) {
  const level = levels[index % levels.length];
  return {
    id: index,
    level,
    message: `event-${String(index).padStart(4, '0')} processed in ${12 + (index % 37)}ms`
  };
}

function appendLog() {
  logs.value = [...logs.value, createLog(tick++)];
}

const timer = setInterval(appendLog, 350);

onUnmounted(() => {
  clearInterval(timer);
});

function getLog(index) {
  return logs.value[index];
}

function levelColor(level) {
  if (level === 'error') return 'red';
  if (level === 'warn') return 'yellow';
  if (level === 'debug') return 'gray';
  return 'green';
}

function formatLog(log, index) {
  return `${String(log.id).padStart(4, '0')} [${log.level.toUpperCase()}] ${log.message}`;
}

function onScroll(event) {
  scrollStart.value = event.visibleStart;
  scrollEnd.value = Math.max(event.visibleStart, event.visibleEnd - 1);
}

function onPrune(event) {
  logs.value = logs.value.slice(event.dropCount);
  droppedCount.value += event.dropCount;
}
</script>
