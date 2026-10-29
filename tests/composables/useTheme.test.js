/**
 * Tests for useTheme composable
 */

import { describe, expect, test } from 'bun:test';
import { useTheme } from '../../src/composables/useTheme.js';

describe('useTheme', () => {
  const theme = useTheme();

  test('listThemes returns available theme names', () => {
    const names = theme.listThemes();

    expect(Array.isArray(names)).toBe(true);
    expect(names.length).toBeGreaterThan(0);
    expect(names).toContain('GITHUB_LIGHT');
  });

  test('getTheme returns theme object or null', () => {
    expect(theme.getTheme('GITHUB_LIGHT')).toBeTruthy();
    expect(theme.getTheme('DOES_NOT_EXIST')).toBeNull();
  });

  test('setTheme throws with available themes for unknown name', () => {
    expect(() => theme.setTheme('NOT_A_THEME')).toThrow(/not found/);
  });

  test('findThemes matches theme names case-insensitively', () => {
    const results = theme.findThemes('github');

    expect(results.length).toBeGreaterThan(0);
    expect(results.every(r => r.name.toLowerCase().includes('github'))).toBe(true);
  });

  test('findThemes does not throw on invalid regex pattern', () => {
    expect(() => theme.findThemes('(')).not.toThrow();
    expect(theme.findThemes('(')).toEqual([]);
  });

  test('getAllThemes returns a copy of all themes', () => {
    const all = theme.getAllThemes();

    expect(all).toBeTruthy();
    expect(Object.keys(all).length).toBeGreaterThan(0);
    // Mutating the copy must not affect the source
    const key = Object.keys(all)[0];
    const before = all[key];
    delete all[key];
    expect(theme.getTheme(key)).toBe(before);
  });
});
