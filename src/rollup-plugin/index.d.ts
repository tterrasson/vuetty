import type { Plugin } from "rollup";

export interface VuettyPluginOptions {
  featureFlags?: Record<string, string>;
  compilerOptions?: Record<string, any>;
  [key: string]: any;
}

export function vuettyPlugin(options?: VuettyPluginOptions): Plugin;
