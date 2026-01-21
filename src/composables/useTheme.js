import { inject, computed } from 'vue';
import { VUETTY_THEME_KEY, VUETTY_INSTANCE_KEY } from '@core/vuettyKeys.js';
import * as generatedThemes from '@core/generated-themes.js';

/**
 * Composable pour gérer les thèmes de l'application
 * @returns {Object} API du composable
 */
export function useTheme() {
  // Injecter le thème et l'instance Vuetty
  const injectedTheme = inject(VUETTY_THEME_KEY, null);
  const vuettyInstance = inject(VUETTY_INSTANCE_KEY, null);

  /**
   * Liste tous les thèmes disponibles
   * @returns {Array<string>} Noms des thèmes
   */
  const listThemes = () => {
    return Object.keys(generatedThemes);
  };

  /**
   * Récupère un thème par son nom
   * @param {string} themeName - Nom du thème (ex: 'GITHUB_LIGHT')
   * @returns {Object|null} Objet du thème ou null si non trouvé
   */
  const getTheme = (themeName) => {
    return generatedThemes[themeName] || null;
  };

  /**
   * Définit le thème actuel
   * @param {string} themeName - Nom du thème à activer
   * @throws {Error} Si le thème n'existe pas
   */
  const setTheme = (themeName) => {
    const newTheme = getTheme(themeName);

    if (!newTheme) {
      const availableThemes = listThemes().join(', ');
      throw new Error(
        `Theme '${themeName}' not found. Available themes: ${availableThemes}`
      );
    }

    // Mettre à jour l'objet thème injecté de manière réactive
    if (injectedTheme) {
      // Copier toutes les propriétés du nouveau thème dans l'objet injecté
      Object.keys(injectedTheme).forEach(key => delete injectedTheme[key]);
      Object.assign(injectedTheme, newTheme);
    }

    // Mettre à jour le background du terminal et le themeBgCode
    if (vuettyInstance) {
      // Importer dynamiquement les fonctions de colorUtils
      import('@utils/colorUtils.js').then(({ colorToAnsiBg, colorToOSC11 }) => {
        // Mettre à jour le themeBgCode pour le rendu
        vuettyInstance.themeBgCode = colorToAnsiBg(newTheme.background);

        // Mettre à jour le background du terminal (OSC 11)
        if (newTheme.background) {
          const bgRgbFormat = colorToOSC11(newTheme.background);
          if (bgRgbFormat) {
            process.stdout.write(`\x1b]11;${bgRgbFormat}\x07`);
          }
        }

        // Effacer les caches qui dépendent du thème
        if (vuettyInstance.logUpdate) {
          vuettyInstance.logUpdate.clear();
        }

        // Invalider le cache de lignes visibles
        vuettyInstance.visibleLinesCache = {
          offset: -1,
          lines: null,
          output: null
        };

        // Forcer un re-render complet
        if (vuettyInstance.renderer && vuettyInstance.renderer.forceUpdate) {
          vuettyInstance.renderer.forceUpdate();
        }
      });
    }
  };

  /**
   * Récupère tous les thèmes avec leurs données
   * @returns {Object} Objet contenant tous les thèmes
   */
  const getAllThemes = () => {
    return { ...generatedThemes };
  };

  /**
   * Trouve des thèmes par pattern
   * @param {string} pattern - Pattern de recherche (ex: 'DARK', 'LIGHT', 'GITHUB')
   * @returns {Array<Object>} Liste des thèmes correspondants
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
