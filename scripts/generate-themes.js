#!/usr/bin/env bun

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Simple TOML parser for our specific structure
function parseToml(content) {
  const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
  const result = { colors: {} };
  let currentSection = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Section headers
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const sectionPath = trimmed.slice(1, -1);
      const sections = sectionPath.split('.');
      let current = result;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (!current[section]) {
          current[section] = {};
        }
        current = current[section];
      }

      currentSection = sections;
      continue;
    }

    // Key-value pairs
    if (trimmed.includes('=')) {
      const [key, value] = trimmed.split('=').map(s => s.trim());
      const cleanValue = value.replace(/"/g, '');

      if (currentSection) {
        let current = result;
        for (const section of currentSection) {
          current = current[section];
        }
        current[key] = cleanValue;
      }
    }
  }

  return result;
}

// Map TOML colors to Vuetty theme structure
function mapToVuettyTheme(tomlData, themeName) {
  const colors = tomlData.colors || {};
  const normal = colors.normal || {};
  const bright = colors.bright || {};
  const primary = colors.primary || {};

  return {
    name: themeName,
    background: primary.background || '#000000',
    foreground: primary.foreground || '#ffffff',

    // Map terminal colors to semantic colors
    primary: normal.blue || bright.blue || '#3d5eff',
    secondary: normal.black || bright.black || '#969ebd',
    success: normal.green || bright.green || '#4ecca3',
    warning: normal.yellow || bright.yellow || '#c97945',
    danger: normal.red || bright.red || '#d64d64',
    info: normal.cyan || bright.cyan || '#5eb3d6',

    components: {
      box: {
        color: normal.black || bright.black || '#4a4f6a',
        bg: null
      },
      textBox: {
        color: primary.foreground || '#e6e8f0',
        bg: null
      },
      textInput: {
        color: primary.foreground || '#e6e8f0',
        bg: primary.background || '#16172a',
        focusColor: bright.magenta || normal.magenta || '#7d5fff',
        errorColor: normal.red || bright.red || '#d64d64'
      },
      button: {
        variants: {
          primary: { bg: normal.blue || bright.blue || '#3d5eff', color: '#ffffff', bold: true },
          secondary: { bg: normal.black || bright.black || '#5a617a', color: primary.foreground || '#e6e8f0', bold: false },
          danger: { bg: normal.red || bright.red || '#d64d64', color: '#ffffff', bold: true },
          warning: { bg: normal.yellow || bright.yellow || '#c97945', color: '#ffffff', bold: true },
          info: { bg: normal.cyan || bright.cyan || '#5eb3d6', color: primary.background || '#0a0a0f', bold: false },
          success: { bg: normal.green || bright.green || '#4ecca3', color: primary.background || '#0a0a0f', bold: true }
        }
      },
      checkbox: {
        color: normal.black || bright.black || '#5a617a',
        checkedColor: bright.magenta || normal.magenta || '#7d5fff',
        uncheckedColor: normal.black || bright.black || '#4a4f6a'
      },
      radiobox: {
        color: normal.black || bright.black || '#5a617a',
        selectedColor: bright.magenta || normal.magenta || '#7d5fff',
        unselectedColor: normal.black || bright.black || '#4a4f6a'
      }
    }
  };
}

// Main function
async function generateThemes() {
  const themesDir = join(import.meta.dir, '..', 'themes');
  const outputFile = join(import.meta.dir, '..', 'src', 'core', 'generated-themes.js');

  console.log(`Parsing TOML files from: ${themesDir}`);

  const tomlFiles = readdirSync(themesDir).filter(file => file.endsWith('.toml'));
  console.log(`Found ${tomlFiles.length} TOML files`);

  const themes = {};

  for (const file of tomlFiles) {
    const filePath = join(themesDir, file);
    const content = readFileSync(filePath, 'utf-8');
    const tomlData = parseToml(content);

    const themeName = file.replace('.toml', '').replace(/-/g, '_').toUpperCase();
    const vuettyTheme = mapToVuettyTheme(tomlData, themeName);

    themes[themeName] = vuettyTheme;
    console.log(`✓ Processed ${file} -> ${themeName}`);
  }

  // Generate the output file
  const outputContent = `// Auto-generated themes from TOML files
// Generated on: ${new Date().toISOString()}

${Object.entries(themes).map(([name, theme]) =>
`export const ${name} = ${JSON.stringify(theme, null, 2)};`
).join('\n\n')}

// Export all themes as a collection
export const THEMES = {
${Object.keys(themes).map(name => `  ${name}`).join(',\n')}
};

// Theme selector utility
export function getTheme(name) {
  return THEMES[name.toUpperCase()];
}

// List all available themes
export function listThemes() {
  return Object.keys(THEMES);
}
`;

  writeFileSync(outputFile, outputContent);
  console.log(`\n✅ Generated themes file: ${outputFile}`);
  console.log(`📊 Total themes generated: ${Object.keys(themes).length}`);
}

// Run the script
generateThemes().catch(console.error);