import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import alias from '@rollup/plugin-alias';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { vuettyPlugin } from 'vuetty/rollup-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  input: './src/index.js',
  output: {
    file: './dist/bundle.js',
    format: 'esm',
    sourcemap: false,
    inlineDynamicImports: true,
  },
  external: [
    'vue',
    'pinia',
    'vuetty',
    /^node:/,
    /^bun:/,
  ],
  plugins: [
    alias({
      entries: [
        { find: '@', replacement: resolve(__dirname, 'src') },
        { find: '@pages', replacement: resolve(__dirname, 'src/pages') },
        { find: '@stores', replacement: resolve(__dirname, 'src/stores') },
        { find: '@components', replacement: resolve(__dirname, 'src/components') },
      ],
    }),
    vuettyPlugin(),
    nodeResolve({
      extensions: ['.js', '.vue', '.json'],
      preferBuiltins: true,
    }),
    commonjs(),
    json(),
  ],
};
