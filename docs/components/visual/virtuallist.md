# VirtualList

The `VirtualList` component renders a fixed-height, focusable viewport for large or continuously growing lists. It only mounts the visible rows plus a small overscan range, keeps its internal item cache bounded, and supports lazy item loading with synchronous or asynchronous sources.

Use it for logs, event streams, command output, long result sets, or any list where rendering every item as a Vue subtree would waste memory.

## Basic Usage

```vue
<template>
  <VirtualList :count="logs.length" :height="10" :getItem="getLog">
    <template #default="{ item, index, loading }">
      <TextBox>
        {{ loading ? 'Loading...' : `${index}: ${item.message}` }}
      </TextBox>
    </template>
  </VirtualList>
</template>

<script setup>
import { ref } from 'vue';
import { TextBox, VirtualList } from 'vuetty';

const logs = ref([
  { id: 1, message: 'Server started' },
  { id: 2, message: 'Database connected' },
  { id: 3, message: 'Worker ready' }
]);

function getLog(index) {
  return logs.value[index];
}
</script>
```

## Mental Model

`VirtualList` virtualizes Vue rendering, not your source data.

- The component renders only `height / itemHeight` rows plus `overscan`.
- Rows outside that mounted range are unmounted, so their local Vue state is lost.
- Loaded items are cached internally, but that cache is bounded by `height`, `overscan`, and `cacheBuffer`.
- Your source array, database cursor, or external store is still owned by your application.

For a long-running feed, use `maxItems` and handle the `prune` event to compact your source data explicitly.

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | required | Total number of currently addressable items |
| `height` | `number` | required | Local viewport height in terminal rows |
| `itemHeight` | `number` | `1` | Fixed terminal-row height for each item |
| `getItem` | `(index) => item \| Promise<item>` | required | Lazy item source. Called only for the mounted range |
| `keyExtractor` | `(item, index) => string \| number` | item `id`, `key`, `value`, then index | Stable key for mounted rows |
| `overscan` | `number` | `3` | Extra items mounted before and after the visible window |
| `cacheBuffer` | `number \| null` | `overscan * 2` | Extra cached items beyond visible rows and overscan |
| `maxItems` | `number \| null` | `null` | Emit `prune` when `count` grows beyond this value |
| `autoScrollToBottom` | `boolean` | `true` | Follow appended items while already scrolled to the bottom |
| `disabled` | `boolean` | `false` | Disable focus and scrolling |
| `focusColor` | `string` | `'cyan'` | Color applied while focused |
| `emptyText` | `string` | `'(empty list)'` | Text shown when `count` is zero |
| `loadingText` | `string` | `'Loading...'` | Default loading text when no slot is provided |
| `color` | `string` | `-` | Text color |
| `bg` | `string` | `-` | Background color |

## Layout Props (Box Props)

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `flex` | `number \| string` | `null` | Flex shorthand when inside a flex container |
| `flexGrow` | `number` | `null` | Flex grow factor |
| `flexShrink` | `number` | `null` | Flex shrink factor |
| `flexBasis` | `number \| string` | `null` | Flex basis |
| `alignSelf` | `string` | `null` | Self alignment: 'auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline' |
| `width` | `number \| string` | `null` | Width (chars or %) |
| `minWidth` | `number` | `null` | Minimum width |
| `maxWidth` | `number` | `null` | Maximum width |
| `minHeight` | `number` | `null` | Minimum height |
| `maxHeight` | `number` | `null` | Maximum height |
| `padding` | `number` | `null` | Padding |
| `paddingLeft` | `number` | `null` | Left padding |
| `paddingRight` | `number` | `null` | Right padding |
| `paddingTop` | `number` | `null` | Top padding |
| `paddingBottom` | `number` | `null` | Bottom padding |
| `margin` | `number` | `null` | Margin |
| `marginLeft` | `number` | `null` | Left margin |
| `marginRight` | `number` | `null` | Right margin |
| `marginTop` | `number` | `null` | Top margin |
| `marginBottom` | `number` | `null` | Bottom margin |

## Slot Props

| Name | Type | Description |
|------|------|-------------|
| `item` | `any \| null` | Loaded item, or `null` while loading |
| `index` | `number` | Current item index in the source |
| `loading` | `boolean` | `true` while `getItem(index)` is pending |
| `error` | `any \| null` | Error captured from `getItem` |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `scroll` | `{ scrollOffset, visibleStart, visibleEnd, renderStart, renderEnd }` | Emitted when the local viewport changes |
| `prune` | `{ dropCount, keepStart, count, maxItems }` | Emitted when `count > maxItems`; use it to compact your source |
| `focus` | - | Component gained focus |
| `blur` | - | Component lost focus |

## Interaction

When focused, `VirtualList` handles:

| Key | Behavior |
|-----|----------|
| `Up` / `Down` | Scroll one item |
| `PageUp` / `PageDown` | Scroll one viewport |
| `Home` | Jump to the first item |
| `End` | Jump to the last item |
| Mouse wheel | Scroll locally when the pointer is over the component |

Mouse wheel events outside the component continue to fall back to Vuetty's global viewport scrolling.

## Streaming Feed

For append-only feeds, `autoScrollToBottom` keeps the viewport pinned to the newest items while the user is already at the bottom. If the user scrolls up to inspect older rows, new items do not move the viewport.

```vue
<template>
  <Col :gap="1">
    <VirtualList
      :count="logs.length"
      :height="12"
      :getItem="getLog"
      autoScrollToBottom
      @scroll="onScroll"
    >
      <template #default="{ item, loading }">
        <TextBox :dim="loading">
          {{ loading ? 'Loading...' : item.message }}
        </TextBox>
      </template>
    </VirtualList>

    <TextBox dim>
      Visible rows: {{ visibleStart }}-{{ visibleEnd }}
    </TextBox>
  </Col>
</template>

<script setup>
import { onUnmounted, ref } from 'vue';
import { Col, TextBox, VirtualList } from 'vuetty';

const logs = ref([]);
const visibleStart = ref(0);
const visibleEnd = ref(0);
let id = 0;

const timer = setInterval(() => {
  logs.value = [
    ...logs.value,
    { id, message: `event-${String(id++).padStart(4, '0')}` }
  ];
}, 500);

onUnmounted(() => clearInterval(timer));

function getLog(index) {
  return logs.value[index];
}

function onScroll(event) {
  visibleStart.value = event.visibleStart;
  visibleEnd.value = Math.max(event.visibleStart, event.visibleEnd - 1);
}
</script>
```

## Long-Running Feeds and Pruning

`VirtualList` cannot safely mutate your array for you. If your app runs all day and keeps appending to `logs`, that array will grow unless you compact it.

Set `maxItems` to ask `VirtualList` to emit `prune` whenever your source grows beyond a safe size:

```vue
<template>
  <Col :gap="1">
    <VirtualList
      :count="logs.length"
      :height="12"
      :getItem="getLog"
      :maxItems="1000"
      :keyExtractor="logKey"
      @prune="onPrune"
    >
      <template #default="{ item, loading }">
        <TextBox :dim="loading">
          {{ loading ? 'Loading...' : `${item.id}: ${item.message}` }}
        </TextBox>
      </template>
    </VirtualList>

    <TextBox dim>
      Kept: {{ logs.length }} | Dropped: {{ droppedCount }}
    </TextBox>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, TextBox, VirtualList } from 'vuetty';

const logs = ref([]);
const droppedCount = ref(0);

function getLog(index) {
  return logs.value[index];
}

function logKey(log) {
  return log.id;
}

function onPrune(event) {
  logs.value = logs.value.slice(event.dropCount);
  droppedCount.value += event.dropCount;
}
</script>
```

When the source is compacted and `count` decreases, `VirtualList` treats the removed rows as items dropped from the top. It shifts `scrollOffset` by the same amount so the user's current content stays anchored while possible. If the inspected area is eventually pruned away, the viewport clamps to the top. The component also clears its index-based internal cache and reloads the visible range, avoiding stale item mappings and duplicate Vue keys.

## Async Sources

`getItem` can return a Promise. Pending loads are deduplicated per index and are also bounded by the same cache window.

```vue
<template>
  <VirtualList
    :count="totalRows"
    :height="15"
    :getItem="getRow"
    :keyExtractor="row => row.id"
  >
    <template #default="{ item, index, loading, error }">
      <TextBox :color="error ? 'red' : undefined" :dim="loading">
        {{
          error
            ? `Failed to load row ${index}`
            : loading
              ? `Loading row ${index}...`
              : `${item.id}: ${item.name}`
        }}
      </TextBox>
    </template>
  </VirtualList>
</template>

<script setup>
import { TextBox, VirtualList } from 'vuetty';

const totalRows = 10000;

async function getRow(index) {
  const response = await fetch(`/api/rows/${index}`);
  return response.json();
}
</script>
```

## Fixed Item Height

`VirtualList` assumes every item has the same terminal height. The default is one row.

If each item renders two rows, set `itemHeight`:

```vue
<template>
  <VirtualList
    :count="items.length"
    :height="12"
    :itemHeight="2"
    :getItem="index => items[index]"
  >
    <template #default="{ item }">
      <Col :height="2">
        <TextBox bold>{{ item.title }}</TextBox>
        <TextBox dim>{{ item.subtitle }}</TextBox>
      </Col>
    </template>
  </VirtualList>
</template>
```

If an item renders more than `itemHeight` rows, the rendered output is clipped. If it renders fewer rows, the row is padded to keep scroll math stable.

## Stable Keys

Use `keyExtractor` when your items have stable IDs. This is especially important for feeds where old rows are pruned and array indices are reused.

```vue
<VirtualList
  :count="logs.length"
  :height="20"
  :getItem="index => logs[index]"
  :keyExtractor="log => log.id"
/>
```

The default key extractor uses `item.id`, then `item.key`, then `item.value`, and finally the current index.

## Performance Notes

- Keep `itemHeight` fixed and accurate.
- Keep `overscan` small. Values between `2` and `6` are usually enough.
- Increase `cacheBuffer` only if `getItem` is expensive and users frequently scroll back and forth near the current window.
- Use `maxItems` for 24/7 feeds if your source is an in-memory array.
- Store any row state outside the row component if it must survive unmounting.

## Full Example

Run the included feed example:

```bash
bun run dev virtual-list
```

The example appends rows on a timer, follows the bottom while live, and prunes the source array once it exceeds the configured maximum.
