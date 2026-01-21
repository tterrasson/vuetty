# Markdown

The Markdown component renders markdown content in the terminal with full support for headings, lists, code blocks, tables, and more. It provides extensive styling options for customizing the appearance of each element.

## Basic Usage

```vue
<template>
  <Markdown content="# Hello World\n\nThis is **bold** and _italic_ text." />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

<!-- Image placeholder: /images/components/markdown-basic.png - Basic Markdown -->
*Simple markdown rendering with headings and text styling*

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | `''` | Markdown content to render (required) |
| `width` | `number` | `null` | Fixed width in characters (auto if not set) |
| `padding` | `number` | `0` | Interior padding (spaces from border to content) |
| `h1Color` | `string` | `'cyan'` | Color for H1 headings |
| `h2Color` | `string` | `'cyan'` | Color for H2 headings |
| `h3Color` | `string` | `'blue'` | Color for H3 headings |
| `h4Color` | `string` | `'blue'` | Color for H4 headings |
| `h5Color` | `string` | `'blue'` | Color for H5 headings |
| `h6Color` | `string` | `'blue'` | Color for H6 headings |
| `codeColor` | `string` | `'yellow'` | Code text color |
| `codeBg` | `string` | `'black'` | Code background color |
| `linkColor` | `string` | `'blue'` | Link color |
| `emphasisColor` | `string` | `'white'` | Emphasis (italic) color |
| `strongColor` | `string` | `'white'` | Strong (bold) color |
| `blockquoteColor` | `string` | `'gray'` | Blockquote text color |
| `blockquoteBorderColor` | `string` | `'gray'` | Blockquote border color |
| `listBulletColor` | `string` | `'green'` | List bullet color |
| `listNumberColor` | `string` | `'green'` | List number color |
| `hrColor` | `string` | `'gray'` | Horizontal rule color |
| `hrChar` | `string` | `'─'` | Horizontal rule character |
| `hrLength` | `number` | `60` | Horizontal rule length |
| `tableHeaderColor` | `string` | `'cyan'` | Table header color |
| `tableBorderColor` | `string` | `'white'` | Table border color |
| `color` | `string` | `-` | Base text color |
| `bg` | `string` | `-` | Background color |
| `bold` | `boolean` | `false` | Bold text |
| `italic` | `boolean` | `false` | Italic text |
| `dim` | `boolean` | `false` | Dimmed text |

## Basic Markdown Elements

### Headings

```vue
<template>
  <Markdown content="# Heading 1\n## Heading 2\n### Heading 3" />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

### Paragraphs and Text Styling

```vue
<template>
  <Markdown content="This is a paragraph with **bold**, _italic_, and `code` text." />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

### Lists

```vue
<template>
  <Markdown content="- Item 1\n- Item 2\n- Item 3\n\n1. First\n2. Second\n3. Third" />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

### Code Blocks

```vue
<template>
  <Markdown content="```javascript\nconst x = 10;\nconsole.log(x);\n```" />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

### Tables

```vue
<template>
  <Markdown content="| Name | Age |\n|------|-----|\n| John | 30 |\n| Jane | 25 |" />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

### Blockquotes

```vue
<template>
  <Markdown content="> This is a blockquote.\n> It can span multiple lines." />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

### Horizontal Rules

```vue
<template>
  <Markdown content="Content above\n\n---\n\nContent below" />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

## Custom Styling

### Heading Colors

```vue
<template>
  <Markdown
    content="# Red Heading\n## Green Subheading"
    h1Color="red"
    h2Color="green"
  />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

### Code Block Styling

```vue
<template>
  <Markdown
    content="```\ncode here\n```"
    codeColor="magenta"
    codeBg="black"
  />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

### Link Styling

```vue
<template>
  <Markdown
    content="[Visit Vuetty](https://vuetty.js.org)"
    linkColor="cyan"
  />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

### List Styling

```vue
<template>
  <Markdown
    content="- Item 1\n- Item 2"
    listBulletColor="yellow"
  />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

## Width and Layout

### Fixed Width

```vue
<template>
  <Markdown
    content="# Title\n\nContent here"
    :width="50"
  />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

### Auto Width

```vue
<template>
  <Markdown
    content="# Title\n\nContent here"
  />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

### With Padding

```vue
<template>
  <Markdown
    content="# Title\n\nContent here"
    :padding="2"
  />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

## Usage with Other Components

### With Box

```vue
<template>
  <Box :padding="1" color="cyan">
    <Markdown content="# Documentation\n\nThis is markdown inside a box." />
  </Box>
</template>

<script setup>
import { Box, Markdown } from 'vuetty';
</script>
```

### With Row and Col

```vue
<template>
  <Row gap="2">
    <Col flex="1">
      <Markdown content="# Left Column\n\nContent here" />
    </Col>
    <Col flex="1">
      <Markdown content="# Right Column\n\nMore content" />
    </Col>
  </Row>
</template>

<script setup>
import { Row, Col, Markdown } from 'vuetty';
</script>
```

## Common Patterns

### Documentation Page

```vue
<template>
  <Markdown :padding="1">
    # Getting Started\n\n## Installation\n\n```bash\nnpm install vuetty\n```\n\n## Usage\n\nImport components and start building!\n  </Markdown>
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```

### README Display

```vue
<template>
  <Box :padding="1" color="white">
    <Markdown
      content="# Project Title\n\nA brief description of your project.\n\n## Features\n\n- Feature 1\n- Feature 2\n- Feature 3\n\n## Installation\n\n```bash\nnpm install my-project\n```"
    />
  </Box>
</template>

<script setup>
import { Box, Markdown } from 'vuetty';
</script>
```

### Help Section

```vue
<template>
  <Markdown
    content="# Help\n\n## Commands\n\n- `start`: Start the server\n- `build`: Build for production\n- `test`: Run tests\n\n## Options\n\n| Option | Description |\n|--------|-------------|\n| --port | Server port |\n| --env | Environment |"
    :padding="1"
  />
</template>

<script setup>
import { Markdown } from 'vuetty';
</script>
```