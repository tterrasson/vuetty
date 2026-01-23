import { $ } from "bun";

await $`bun run clean`;
await $`bun run build:rollup`;
await $`bun run build:types`;
await $`cp src/build/*.js dist/build/`;
await $`bun run build:debug-assets`;
