// src/build/bun-loader.js
/**
 * Bun plugin for .vue files - for development/examples only
 * Users should use the Rollup plugin for production builds
 */
import { plugin } from 'bun';
import { compileSFC } from './compiler-core.js';
import { readFileSync } from 'node:fs';

plugin({
  name: 'vuetty-bun-loader',

  setup(build) {
    build.onLoad({ filter: /\.vue$/ }, async ({ path }) => {
      const source = readFileSync(path, 'utf-8');
      const { code, errors } = compileSFC(source, path);

      if (errors.length > 0) {
        console.error(`Vuetty SFC compilation failed for ${path}:`);
        for (const error of errors) {
          console.error(`  ${error.message}`);
        }
        throw new Error('SFC compilation failed');
      }

      return {
        contents: code,
        loader: 'js'
      };
    });
  }
});
