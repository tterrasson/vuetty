const example = (id, title, relativePath) => ({
  id,
  title,
  url: new URL(relativePath, import.meta.url)
});

export const examples = [
  example('box', 'Box', './components/Box.vue'),
  example('textbox', 'TextBox', './components/TextBox.vue'),
  example('row', 'Row', './components/Row.vue'),
  example('col', 'Col', './components/Col.vue'),
  example('divider', 'Divider', './components/Divider.vue'),
  example('spacer', 'Spacer', './components/Spacer.vue'),
  example('newline', 'Newline', './components/Newline.vue'),
  example('button', 'Button', './components/Button.vue'),
  example('text-input', 'TextInput', './components/TextInput.vue'),
  example('select-input', 'SelectInput', './components/SelectInput.vue'),
  example('checkbox', 'Checkbox', './components/Checkbox.vue'),
  example('radiobox', 'Radiobox', './components/Radiobox.vue'),
  example('table', 'Table', './components/Table.vue'),
  example('spinner', 'Spinner', './components/Spinner.vue'),
  example('progress-bar', 'ProgressBar', './components/ProgressBar.vue'),
  example('markdown', 'Markdown', './components/Markdown.vue'),
  example('gradient', 'Gradient', './components/Gradient.vue'),
  example('big-text', 'BigText', './components/BigText.vue'),
  example('full-layout', 'Full Layout', './components/FullLayout.vue'),
  example('image', 'Image', './components/Image.vue'),
  example('tree', 'Tree', './components/Tree.vue')
];
