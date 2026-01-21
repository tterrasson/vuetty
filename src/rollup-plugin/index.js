// src/rollup-plugin/index.js
/**
 * Rollup plugin for Vuetty .vue files
 * Users add this to their rollup.config.js
 *
 * Example usage:
 *   import { vuettyPlugin } from 'vuetty/rollup-plugin';
 *   export default {
 *     plugins: [vuettyPlugin()]
 *   };
 */
import { compileSFC } from '../build/compiler-core.js';
import { readFileSync } from 'node:fs';

export function vuettyPlugin(options = {}) {
  // Default Vue feature flags
  const defaultFeatureFlags = {
    '__VUE_OPTIONS_API__': 'true',
    '__VUE_PROD_DEVTOOLS__': 'false',
    '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': 'false',
  };

  // Allow user to override feature flags
  const featureFlags = {
    ...defaultFeatureFlags,
    ...(options.featureFlags || {})
  };

  return {
    name: 'vuetty',

    // Replace Vue feature flags in all JavaScript/TypeScript files
    transform(code, id) {
      // Only process JS/TS files (not .vue files, they're handled in load)
      if (!/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(id)) return null;

      let modifiedCode = code;
      let hasReplacement = false;

      // Replace each feature flag
      for (const [key, value] of Object.entries(featureFlags)) {
        const regex = new RegExp(key, 'g');
        if (regex.test(modifiedCode)) {
          modifiedCode = modifiedCode.replace(regex, value);
          hasReplacement = true;
        }
      }

      return hasReplacement ? { code: modifiedCode, map: null } : null;
    },

    // Load and compile .vue files
    load(id) {
      if (!id.endsWith('.vue')) return null;

      const source = readFileSync(id, 'utf-8');
      const { code, errors } = compileSFC(source, id, options);

      if (errors.length > 0) {
        const errorMsg = errors.map(e =>
          `${e.message}${e.location ? ` at ${e.location.file}:${e.location.line}:${e.location.column}` : ''}`
        ).join('\n');
        this.error(`Vuetty SFC compilation failed:\n${errorMsg}`);
      }

      return { code, map: null };
    }
  };
}
