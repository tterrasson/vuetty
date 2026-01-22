# Table

The Table component renders an interactive, keyboard-navigable table with row selection, highlighting, and comprehensive styling options. It's designed for displaying and interacting with tabular data in terminal UIs.

## Basic Example

```vue
<template>
  <Table
    :headers="['Name', 'Age', 'City']"
    :rows="[
      ['Alice', '28', 'New York'],
      ['Bob', '34', 'San Francisco'],
      ['Charlie', '25', 'Austin']
    ]"
    v-model="selectedIndex"
  />
</template>

<script setup>
import { ref } from 'vue';
import { Table } from 'vuetty';

const selectedIndex = ref(null);
</script>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number` | `null` | v-model: selected row index |
| `headers` | `array` | `[]` | Column header labels (required) |
| `rows` | `array` | `[]` | Row data as array of arrays (required) |
| `label` | `string` | `''` | Optional label displayed above the table |
| `height` | `number` | `10` | Number of visible rows |
| `columnWidths` | `array` | `null` | Manual column widths (auto-calculated if null) |
| `striped` | `boolean` | `true` | Alternate row background colors |
| `showHeader` | `boolean` | `true` | Display header row |
| `disabled` | `boolean` | `false` | Disable interaction |
| `color` | `string` | - | Border color |
| `bg` | `string` | - | Background color |
| `focusColor` | `string` | `'cyan'` | Color when focused |
| `selectedColor` | `string` | `'green'` | Color for selected rows |
| `highlightColor` | `string` | `'yellow'` | Color for highlighted row |
| `headerColor` | `string` | `'white'` | Header text color |
| `stripedColor` | `string` | `'black'` | Striped row background |
| `bold` | `boolean` | `false` | Bold text |
| `dim` | `boolean` | `false` | Dimmer text |
| `hint` | `string\|boolean` | `'default'` | Help text (default, custom string, or false to hide) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `number` | Selected row index changed |
| `change` | `number` | Row selection changed |
| `select` | `object` | Selection event with index and row data |
| `focus` | - | Table gained focus |
| `blur` | - | Table lost focus |

## Event Usage

```vue
<template>
  <Col gap="1">
    <TextBox bold color="cyan">Employee List</TextBox>
    <Table
      :headers="['ID', 'Name', 'Department']"
      :rows="employees"
      v-model="selectedEmployeeId"
      @change="onEmployeeSelected"
    />
    <TextBox v-if="selectedEmployee" color="green">
      Selected: {{ selectedEmployee.name }}
    </TextBox>
  </Col>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Col, TextBox, Table } from 'vuetty';

const employees = [
  [1, 'Alice Johnson', 'Engineering'],
  [2, 'Bob Smith', 'Marketing'],
  [3, 'Charlie Brown', 'Sales'],
  [4, 'Diana Prince', 'Engineering'],
  [5, 'Eve Wilson', 'HR']
];

const selectedEmployeeId = ref(null);

const selectedEmployee = computed(() => {
  if (selectedEmployeeId.value === null) return null;
  const row = employees[selectedEmployeeId.value];
  return { id: row[0], name: row[1], department: row[2] };
});

const onEmployeeSelected = (index) => {
  console.log('Selected row:', index);
};
</script>
```

## Column Widths

### Auto Width Calculation

By default, column widths are calculated from header and row content:

```vue
<template>
  <Table
    :headers="['Product', 'Quantity', 'Price']"
    :rows="[
      ['Laptop', '5', '$1200'],
      ['Mouse', '25', '$20'],
      ['Keyboard', '15', '$80']
    ]"
  />
</template>

<script setup>
import { Table } from 'vuetty';
</script>
```

### Custom Column Widths

Specify exact column widths:

```vue
<template>
  <Table
    :headers="['Name', 'Description', 'Status']"
    :rows="data"
    :columnWidths="[15, 40, 12]"
  />
</template>

<script setup>
import { Table } from 'vuetty';

const data = [
  ['Item A', 'A long description that will be truncated', 'Active'],
  ['Item B', 'Another description here', 'Pending'],
  ['Item C', 'Third item description', 'Done']
];
</script>
```

## Selection and Events

### Handle Selection

```vue
<template>
  <Col gap="1">
    <Table
      :headers="['Option', 'Value']"
      :rows="options"
      v-model="selected"
      @select="onSelect"
    />
    <TextBox v-if="selected !== null" color="green">
      You selected: {{ options[selected][0] }}
    </TextBox>
  </Col>
</template>

<script setup>
import { ref } from 'vue';
import { Col, TextBox, Table } from 'vuetty';

const options = [
  ['Copy', '1'],
  ['Paste', '2'],
  ['Delete', '3'],
  ['Undo', '4']
];

const selected = ref(null);

const onSelect = (event) => {
  console.log('Selected index:', event.index);
  console.log('Selected row:', event.row);
};
</script>
```

## Styling

### Custom Colors

```vue
<template>
  <Table
    :headers="['Status', 'Count']"
    :rows="[
      ['Running', '42'],
      ['Stopped', '8'],
      ['Error', '2']
    ]"
    focusColor="green"
    selectedColor="cyan"
    highlightColor="magenta"
    headerColor="white"
  />
</template>

<script setup>
import { Table } from 'vuetty';
</script>
```

### Bold Headers

```vue
<template>
  <Table
    :headers="['Feature', 'Enabled']"
    :rows="[
      ['Dark Mode', 'Yes'],
      ['Notifications', 'Yes'],
      ['Auto-save', 'No']
    ]"
    bold
  />
</template>

<script setup>
import { Table } from 'vuetty';
</script>
```

## Table Label

Add a descriptive label above the table:

```vue
<template>
  <Table
    label="Recent Transactions"
    :headers="['Date', 'Type', 'Amount']"
    :rows="[
      ['2024-01-15', 'Deposit', '+$500'],
      ['2024-01-14', 'Withdrawal', '-$100'],
      ['2024-01-13', 'Transfer', '-$250']
    ]"
  />
</template>

<script setup>
import { Table } from 'vuetty';
</script>
```

## Scrolling

### Visible Height

Control how many rows are visible at once:

```vue
<template>
  <Table
    :headers="['ID', 'Name']"
    :rows="largeDataset"
    :height="5"
  />
</template>

<script setup>
import { Table } from 'vuetty';

const largeDataset = Array.from({ length: 100 }, (_, i) => [
  i + 1,
  `Item ${i + 1}`
]);
</script>
```

### Scroll Indicator

Tables with more rows than the visible height show a scroll percentage indicator at the bottom.

## Keyboard Navigation

When focused, Table responds to:

- **↑ / ↓**: Navigate up/down between rows
- **Home**: Jump to first row
- **End**: Jump to last row
- **Page Up**: Move up by page height
- **Page Down**: Move down by page height
- **Enter / Space**: Select highlighted row
- **Tab**: Move to next field (blur table)

## Striped Rows

Toggle alternating row colors:

```vue
<template>
  <Col gap="2">
    <TextBox bold color="cyan">With Stripes (default)</TextBox>
    <Table
      :headers="['Col1', 'Col2']"
      :rows="data"
      striped
    />

    <TextBox bold color="cyan">Without Stripes</TextBox>
    <Table
      :headers="['Col1', 'Col2']"
      :rows="data"
      :striped="false"
    />
  </Col>
</template>

<script setup>
import { Col, TextBox, Table } from 'vuetty';

const data = [
  ['A', 'Value 1'],
  ['B', 'Value 2'],
  ['C', 'Value 3'],
  ['D', 'Value 4']
];
</script>
```

## Disabled State

Disable user interaction:

```vue
<template>
  <Table
    :headers="['Status', 'Info']"
    :rows="[
      ['Loading', 'Please wait...'],
      ['Processing', 'In progress...']
    ]"
    :disabled="isLoading"
    label="Table is disabled while loading"
  />
</template>

<script setup>
import { ref } from 'vue';
import { Table } from 'vuetty';

const isLoading = ref(true);
</script>
```

## Hide Header

```vue
<template>
  <Table
    :headers="['Name', 'Value']"
    :rows="data"
    :showHeader="false"
  />
</template>

<script setup>
import { Table } from 'vuetty';

const data = [
  ['Item 1', 'Value A'],
  ['Item 2', 'Value B']
];
</script>
```

## Hint Text

### Default Hint

By default, focused tables display navigation help:

```vue
<template>
  <Table
    :headers="['Name', 'Age']"
    :rows="[['Alice', '28'], ['Bob', '34']]"
  />
</template>

<script setup>
import { Table } from 'vuetty';
</script>
```

### Custom Hint

Provide custom help text:

```vue
<template>
  <Table
    :headers="['Action', 'Shortcut']"
    :rows="shortcuts"
    hint="Press Enter to execute the selected action"
  />
</template>

<script setup>
import { Table } from 'vuetty';

const shortcuts = [
  ['Copy', 'Ctrl+C'],
  ['Paste', 'Ctrl+V'],
  ['Save', 'Ctrl+S']
];
</script>
```

### Hide Hint

Hide help text completely:

```vue
<template>
  <Table
    :headers="['Item', 'Value']"
    :rows="data"
    :hint="false"
  />
</template>

<script setup>
import { Table } from 'vuetty';

const data = [
  ['A', '1'],
  ['B', '2']
];
</script>
```

## Common Patterns

### Data Viewer

```vue
<template>
  <Col gap="1">
    <Row justifyContent="space-between">
      <TextBox bold>Data Viewer</TextBox>
      <TextBox color="gray" dim>{{ selectedIndex + 1 }} / {{ data.length }}</TextBox>
    </Row>
    <Table
      :headers="['Field', 'Value']"
      :rows="tableRows"
      v-model="selectedIndex"
    />
  </Col>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Col, Row, TextBox, Table } from 'vuetty';

const data = [
  { id: 1, name: 'Item A', status: 'Active' },
  { id: 2, name: 'Item B', status: 'Pending' },
  { id: 3, name: 'Item C', status: 'Done' }
];

const selectedIndex = ref(0);

const tableRows = computed(() => {
  const item = data[selectedIndex.value];
  return Object.entries(item).map(([key, value]) => [
    key,
    String(value)
  ]);
});
</script>
```

### Multi-Column Display

```vue
<template>
  <Table
    label="System Processes"
    :headers="['PID', 'Name', 'CPU', 'Memory', 'Status']"
    :rows="processes"
    :columnWidths="[8, 20, 8, 10, 12]"
    v-model="selectedPid"
  />
</template>

<script setup>
import { ref } from 'vue';
import { Table } from 'vuetty';

const processes = [
  [1234, 'node', '25%', '512MB', 'Running'],
  [5678, 'chrome', '45%', '1.2GB', 'Running'],
  [9012, 'python', '15%', '256MB', 'Sleeping'],
  [3456, 'git', '5%', '128MB', 'Idle']
];

const selectedPid = ref(null);
</script>
```