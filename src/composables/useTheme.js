import { inject, computed } from 'vue';
import { VUETTY_THEME_KEY, VUETTY_INSTANCE_KEY } from '@core/vuettyKeys.js';
import * as generatedThemes from '@core/generated-themes.js';

/**
 * Composable for managing application themes
 * @returns {Object} Composable API
 */
export function useTheme() {
  // Inject theme and Vuetty instance
  const injectedTheme = inject(VUETTY_THEME_KEY, null);
  const vuettyInstance = inject(VUETTY_INSTANCE_KEY, null);

  /**
   * List all available themes
   * @returns {Array<string>} Theme names
   */
  const listThemes = () => {
    return Object.keys(generatedThemes);
  };

  /**
   * Get a theme by its name
   * @param {string} themeName - Theme name (e.g., 'GITHUB_LIGHT')
   * @returns {Object|null} Theme object or null if not found
   */
  const getTheme = (themeName) => {
    return generatedThemes[themeName] || null;
  };

  /**
   * Set the current theme
   * @param {string} themeName - Theme name to activate
   * @throws {Error} If the theme does not exist
   */
  const setTheme = (themeName) => {
    const newTheme = getTheme(themeName);

    if (!newTheme) {
      const availableThemes = listThemes().join(', ');
      throw new Error(
        `Theme '${themeName}' not found. Available themes: ${availableThemes}`
      );
    }

    // Update the injected theme object reactively
    if (injectedTheme) {
      // Copy all properties of the new theme into the injected object
      Object.keys(injectedTheme).forEach(key => delete injectedTheme[key]);
      Object.assign(injectedTheme, newTheme);
      // Increment version to force component re-render
      injectedTheme.version = (injectedTheme.version || 0) + 1;
    }

    // Update terminal background and themeBgCode
    if (vuettyInstance) {
      // Dynamically import colorUtils functions
      import('@utils/colorUtils.js').then(({ colorToAnsiBg, colorToOSC11 }) => {
        // Update themeBgCode for rendering
        vuettyInstance.themeBgCode = colorToAnsiBg(newTheme.background);

        // Update terminal background (OSC 11)
        if (newTheme.background) {
          const bgRgbFormat = colorToOSC11(newTheme.background);
          if (bgRgbFormat) {
            process.stdout.write(`\x1b]11;${bgRgbFormat}\x07`);
          }
        }

        // Clear theme-dependent caches
        if (vuettyInstance.logUpdate) {
          vuettyInstance.logUpdate.clear();
        }

        // Invalidate visible lines cache
        vuettyInstance.visibleLinesCache = {
          offset: -1,
          lines: null,
          output: null
        };

        // Force complete re-render
        if (vuettyInstance.renderer && vuettyInstance.renderer.forceUpdate) {
          vuettyInstance.renderer.forceUpdate();
        }
      });
    }
  };

  /**
   * Get all themes with their data
   * @returns {Object} Object containing all themes
   */
  const getAllThemes = () => {
    return { ...generatedThemes };
  };

  /**
   * Find themes by pattern
   * @param {string} pattern - Search pattern (e.g., 'DARK', 'LIGHT', 'GITHUB')
   * @returns {Array<Object>} List of matching themes
   */
  const findThemes = (pattern) => {
    const regex = new RegExp(pattern, 'i');
    return listThemes()
      .filter(name => regex.test(name))
      .map(name => ({
        name,
        theme: getTheme(name)
      }));
  };

  // Computed properties
  const theme = computed(() => injectedTheme);
  const themeName = computed(() => injectedTheme?.name || null);
  const isThemeSet = computed(() => injectedTheme !== null);

  return {
    // State
    theme,
    themeName,
    isThemeSet,

    // Methods
    setTheme,
    getTheme,
    listThemes,
    getAllThemes,
    findThemes
  };
}
