// src/build/compiler-core.js
/**
 * Runtime-agnostic Vue SFC compilation core
 * Extracted from vue-sfc-plugin.js to be shared across all runtime adapters
 */
import { parse, compileScript } from '@vue/compiler-sfc';

/**
 * Compile a Vue Single File Component to JavaScript
 * @param {string} source - The .vue file source code
 * @param {string} filepath - The file path (used for error reporting and ID)
 * @param {object} options - Compilation options
 * @returns {{ code: string, errors: Array, map?: object }} Compilation result
 */
export function compileSFC(source, filepath, options = {}) {
  try {
    // Step 1: Parse SFC into descriptor (template, script, style blocks)
    const { descriptor, errors: parseErrors } = parse(source, {
      filename: filepath,
    });

    if (parseErrors.length) {
      return {
        code: '',
        errors: parseErrors.map(e => ({
          message: `SFC Parse Error: ${e.message}`,
          location: e.loc ? {
            file: filepath,
            line: e.loc.start.line,
            column: e.loc.start.column,
          } : undefined,
        })),
      };
    }

    // Step 2: Compile script block with inline template
    // For <script setup>, using inlineTemplate: true automatically handles:
    // - Template compilation
    // - Component resolution (imported components are available)
    // - Reactive state exposure to template
    let scriptCode = '';

    if (descriptor.script || descriptor.scriptSetup) {
      try {
        const compiled = compileScript(descriptor, {
          id: filepath,
          // IMPORTANT: Inline template compilation with script
          // This ensures imported components and setup vars are accessible
          inlineTemplate: true,
          templateOptions: {
            compilerOptions: {
              // Removed isCustomElement - let Vue always resolve as components
              // This ensures component setup() always runs and inputManager injection works
              whitespace: 'preserve',
              comments: false,
              hoistStatic: true,
              ...options.compilerOptions,
            },
          },
        });

        scriptCode = compiled.content;

        // Return compiled code
        return {
          code: scriptCode,
          errors: [],
          map: compiled.map,
        };

      } catch (error) {
        return {
          code: '',
          errors: [{
            message: `Script/Template Compilation Error: ${error.message}`,
            location: error.loc ? {
              file: filepath,
              line: error.loc.start.line,
              column: error.loc.start.column,
            } : undefined,
          }],
        };
      }
    }

    // If no script block, return empty
    return {
      code: '',
      errors: [{
        message: 'SFC has no script or scriptSetup block',
        location: { file: filepath },
      }],
    };

  } catch (error) {
    return {
      code: '',
      errors: [{
        message: `Unexpected SFC Compilation Error: ${error.message}`,
        location: { file: filepath },
      }],
    };
  }
}

/**
 * Format compilation errors for display
 * @param {Array} errors - Array of error objects
 * @param {string} filepath - The file path
 * @returns {Array} Formatted errors
 */
export function formatErrors(errors, filepath) {
  return errors.map(e => ({
    text: e.message || 'Unknown error',
    location: e.location || { file: filepath },
  }));
}
