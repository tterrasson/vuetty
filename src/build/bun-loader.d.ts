/**
 * Bun plugin for .vue files - for development/examples only
 * Users should use the Rollup plugin for production builds
 */

export interface CompileResult {
  code: string;
  errors: Array<{ message: string }>;
}

export function compileSFC(source: string, path: string): CompileResult;
