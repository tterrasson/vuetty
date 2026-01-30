import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/vuetty/',
  title: "Vuetty",
  description: "A Vue.js Custom Renderer for Terminal User Interfaces",
  head: [
    ['link', { rel: 'icon', href: '/vuetty/images/logo-small.webp' }]
  ],
  themeConfig: {
    logo: '/images/logo-small.webp',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started/introduction' },
      {
        text: 'Components',
        items: [
          { text: 'Layout', link: '/components/layout/box' },
          { text: 'Text', link: '/components/text/textbox' },
          { text: 'Input', link: '/components/input/textinput' },
          { text: 'Visual', link: '/components/visual/table' }
        ]
      },
      { text: 'Theming', link: '/guide/theming/' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        collapsed: false,
        items: [
          { text: 'Introduction', link: '/guide/getting-started/introduction' },
          { text: 'Quick Start', link: '/guide/getting-started/quick-start' },
          { text: 'Debug Server', link: '/guide/getting-started/debug-server' },
        ]
      },
      {
        text: 'Layout Components',
        collapsed: true,
        items: [
          { text: 'Box', link: '/components/layout/box' },
          { text: 'Row', link: '/components/layout/row' },
          { text: 'Col', link: '/components/layout/col' }
        ]
      },
      {
        text: 'Text Components',
        collapsed: true,
        items: [
          { text: 'TextBox', link: '/components/text/textbox' },
          { text: 'BigText', link: '/components/text/bigtext' },
          { text: 'Gradient', link: '/components/text/gradient' },
          { text: 'Markdown', link: '/components/text/markdown' }
        ]
      },
      {
        text: 'Input Components',
        collapsed: true,
        items: [
          { text: 'TextInput', link: '/components/input/textinput' },
          { text: 'SelectInput', link: '/components/input/selectinput' },
          { text: 'Tabs', link: '/components/input/tabs' },
          { text: 'Checkbox', link: '/components/input/checkbox' },
          { text: 'Radiobox', link: '/components/input/radiobox' },
          { text: 'Button', link: '/components/input/button' }
        ]
      },
      {
        text: 'Visual Components',
        collapsed: true,
        items: [
          { text: 'Table', link: '/components/visual/table' },
          { text: 'Tree', link: '/components/visual/tree' },
          { text: 'List', link: '/components/visual/list' },
          { text: 'Image', link: '/components/visual/image' },
          { text: 'ProgressBar', link: '/components/visual/progressbar' },
          { text: 'Spinner', link: '/components/visual/spinner' },
          { text: 'Divider', link: '/components/visual/divider' },
          { text: 'Spacer', link: '/components/visual/spacer' },
          { text: 'Newline', link: '/components/visual/newline' },
          { text: 'CodeDiff', link: '/components/visual/codediff' }
        ]
      },
      {
        text: 'Theming',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/guide/theming/' },
          { text: 'Color Management', link: '/guide/theming/colors' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/tterrasson/vuetty' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Vuetty'
    }
  }
})
