import { $ } from "bun";

await $`cp src/index.d.ts dist/`;
await $`mkdir -p dist/rollup-plugin dist/build`;
await $`cp src/rollup-plugin/index.d.ts dist/rollup-plugin/`;
await $`cp src/build/bun-loader.d.ts src/build/bun-loader.js dist/build/`;
