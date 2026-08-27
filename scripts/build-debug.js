import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

// Ensure dist/static directory exists
mkdirSync('./dist/static', { recursive: true });

// Bundle CSS files
const bulmaCSS = await Bun.file('./node_modules/bulma/css/bulma.min.css').text();
const themeCSS = await Bun.file('./src/debug/static/debug-theme.css').text();
const customCSS = await Bun.file('./src/debug/static/debug-custom.css').text();
const bundledCSS = `${bulmaCSS}\n${themeCSS}\n${customCSS}`;

// Create temp file for Bun.build
const tempFile = './.temp-bundle.css';
await Bun.write(tempFile, bundledCSS);

// Bundle CSS with Bun.build
const cssBuild = await Bun.build({
  entrypoints: [tempFile],
  sourcemap: false
});

if (cssBuild.success && cssBuild.outputs.length > 0) {
  const bundledCSS = await cssBuild.outputs[0].text();
  await Bun.write('./dist/static/debug.css', bundledCSS);
  await Bun.file(tempFile).delete();
  console.log('✓ Debug CSS bundled → dist/static/debug.css');
} else {
  console.error('✗ Debug CSS build failed');
  for (const message of cssBuild.logs) {
    console.error(message);
  }
  await Bun.file(tempFile).delete();
}

// Build client JS directly into dist/static
const jsBuild = await Bun.build({
  entrypoints: ['./src/debug/static/debug.js'],
  outdir: './dist/static',
  naming: '[dir]/[name].[ext]'
});

if (jsBuild.success) {
  console.log('✓ Debug client JS bundled → dist/static/debug.js');
} else {
  console.error('✗ Debug client JS build failed');
  for (const message of jsBuild.logs) {
    console.error(message);
  }
}

// Also copy HTML to dist/static
const html = readFileSync('./src/debug/static/index.html', 'utf-8');
writeFileSync('./dist/static/index.html', html);
console.log('✓ Debug HTML copied → dist/static/index.html');

// Copy favicon to dist/static
const favicon = readFileSync('./src/debug/static/favicon.ico');
writeFileSync('./dist/static/favicon.ico', favicon);
console.log('✓ Favicon copied → dist/static/favicon.ico');
