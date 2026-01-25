// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'node:url';
import { dirname, resolve as pathResolve } from 'node:path';;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const externalDeps = [
  // Peer dependencies
  'vue',
  '@vue/compiler-sfc',
  '@vue/runtime-core',
  '@vue/runtime-dom',
  '@vue/reactivity',
  '@vue/shared',

  // package.json
  'yoga-layout',
  'figlet',
  'terminal-image',
  'chalk',
  'string-width',
  'cli-highlight',
  'marked',
  'gradient-string',
  'glob',

  // Runtime
  'bun',

  // Node built-ins
  /^node:/,
];

export default [
  // Build 1: Main library
  {
    input: './src/index.js',
    output: {
      file: './dist/index.js',
      format: 'esm',
      sourcemap: false,
      inlineDynamicImports: true,
    },
    external: externalDeps,
    plugins: [
      alias({
        entries: [
          {
            find: 'figlet',
            replacement: pathResolve(__dirname, 'node_modules/figlet/dist/node-figlet.mjs')
          },
          { find: '@components', replacement: pathResolve(__dirname, 'src/components') },
          { find: '@composables', replacement: pathResolve(__dirname, 'src/composables') },
          { find: '@core', replacement: pathResolve(__dirname, 'src/core') },
          { find: '@utils', replacement: pathResolve(__dirname, 'src/utils') },
          { find: '@effects', replacement: pathResolve(__dirname, 'src/effects') },
          { find: '@build', replacement: pathResolve(__dirname, 'src/build') }
        ]
      }),
      resolve({
        referBuiltins: true,
        browser: false,
        mainFields: ['main', 'module']
      }),
      commonjs({
        transformMixedEsModules: true,
        requireReturnsDefault: 'auto'
      }),
      terser()
    ]
  },

  // Build 2: Rollup plugin (for users)
  {
    input: './src/rollup-plugin/index.js',
    output: {
      file: './dist/rollup-plugin/index.js',
      format: 'esm',
      sourcemap: false,
      inlineDynamicImports: true,
    },
    external: externalDeps,
    plugins: [
      alias({
        entries: [
          { find: '@components', replacement: pathResolve(__dirname, 'src/components') },
          { find: '@composables', replacement: pathResolve(__dirname, 'src/composables') },
          { find: '@core', replacement: pathResolve(__dirname, 'src/core') },
          { find: '@utils', replacement: pathResolve(__dirname, 'src/utils') },
          { find: '@effects', replacement: pathResolve(__dirname, 'src/effects') },
          { find: '@build', replacement: pathResolve(__dirname, 'src/build') }
        ]
      }),
      resolve({
        preferBuiltins: true,
        browser: false,
        mainFields: ['module', 'main']
      }),
      commonjs({
        transformMixedEsModules: true,
        requireReturnsDefault: 'auto'
      }),
      terser()
    ]
  },

  // Build 3: Debug Server
  {
    input: './src/debug/DebugServer.js',
    output: {
      file: './dist/debug/DebugServer.js',
      format: 'esm',
      sourcemap: false,
      inlineDynamicImports: true,
    },
    external: externalDeps,
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs(),
      terser({
        format: { comments: false }
      })
    ]
  }
];
