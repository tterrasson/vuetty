<template>
  <Col :gap="1">
    <TextBox bold color="cyan">Markdown</TextBox>
    <Markdown :content="content" />
  </Col>
</template>

<script setup>
import { Col, Markdown, TextBox } from 'vuetty';

const content = `# Markdown demo

## Basics

- Fast preview
- Lists and emphasis
- Inline code with \`npm run dev\`

**Tip:** Use backticks for code.
_Italic text_ and **bold text** work together.

## Quote + Rule

> This is a blockquote that can span multiple lines
> and stays readable in terminal UI.

---

## Ordered list

1. Install deps
2. Run the app
3. Ship it

## Link + Code block

See the [Vuetty docs](https://vuetty.dev) for more.

\`\`\`js
const value = 42;
console.log(value);
\`\`\`
`;
</script>
