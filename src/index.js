// src/index.js
export { Vuetty, createVuetty, vuetty } from './core/vuetty.js';
export { TUINode, TextNode, CommentNode } from './core/node.js';
export { createTUIRenderer } from './core/renderer.js';
export { renderToString } from './core/render.js';
export * from './components/index.js';

// Export theme utilities
export { createTheme, DEFAULT_THEME, resolveThemeColor } from './core/theme.js';
export { useTheme } from './composables/useTheme.js';

// Export injection keys for advanced usage
export {
  VUETTY_INPUT_MANAGER_KEY,
  VUETTY_THEME_KEY,
  VUETTY_INSTANCE_KEY,
  VUETTY_RENDERER_KEY,
  VUETTY_ROUTER_KEY,
  VUETTY_VIEWPORT_STATE_KEY
} from './core/vuettyKeys.js';

// Export render handler API for custom components
export { RenderHandler, RenderContext, renderHandlerRegistry } from './core/renderHandlers.js';

// Export effect system for custom text effects
export { effectRegistry } from './effects/index.js';
export {
  parseColor, interpolateColor, adjustBrightness, hslToRgb, rgbToHex, rgbToHsl
} from './utils/colorUtils.js';