#!/usr/bin/env bun

// Parse --target argument
const args = process.argv.slice(2);
const targetIndex = args.indexOf('--target');
const target = targetIndex !== -1 && args[targetIndex + 1] ? args[targetIndex + 1] : null;

// Build command arguments
const buildArgs = ['bun', 'build', '--compile', 'dist/bundle.js', '--outfile', 'dist/myapp'];

if (target) {
  buildArgs.push('--target', target);
  console.log(`Compiling for target: ${target}...`);
} else {
  console.log('Compiling...');
}

const proc = Bun.spawn(buildArgs, {
  stdout: 'inherit',
  stderr: 'inherit',
});

const exitCode = await proc.exited;

if (exitCode !== 0) {
  throw new Error(`Build failed with exit code ${exitCode}`);
}

console.log('Compilation successful!');