// src/core/vuettyKeys.js
/**
 * Vuetty Injection Keys
 *
 * These string constants are used for Vue's provide/inject system.
 * We use strings instead of Symbols to ensure consistent identity
 * across module boundaries when the library is bundled.
 * The 'vuetty:' namespace prefix helps avoid conflicts with user code.
 */

/**
 * Injection key for the InputManager instance
 * Used by interactive components (TextInput, Checkbox, etc.)
 */
export const VUETTY_INPUT_MANAGER_KEY = 'vuetty:inputManager';

/**
 * Injection key for the RouterManager instance
 * Used by router components and composables
 */
export const VUETTY_ROUTER_KEY = 'vuetty:router';

/**
 * Injection key for the Vuetty renderer instance
 * Used to access renderer methods like forceUpdate()
 */
export const VUETTY_RENDERER_KEY = 'vuetty:renderer';

/**
 * Injection key for the reactive viewport state
 * Used to trigger re-renders on window resize
 */
export const VUETTY_VIEWPORT_STATE_KEY = 'vuetty:viewportState';

/**
 * Injection key for the Vuetty instance
 * Used by components to register click handlers
 */
export const VUETTY_INSTANCE_KEY = 'vuetty:instance';

/**
 * Injection key for the theme object
 * Used by components to access theme colors and defaults
 */
export const VUETTY_THEME_KEY = 'vuetty:theme';
