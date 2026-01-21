import type { Component, DefineComponent } from "vue";

export interface VuettyOptions {
  theme?: Record<string, any>;
  debugServer?: boolean | Record<string, any>;
  viewport?: Record<string, any>;
  forceColors?: boolean;
  scrollIndicatorMode?: string;
  [key: string]: any;
}

export class Vuetty {
  constructor(options?: VuettyOptions);
  [key: string]: any;
}

export function createVuetty(options?: VuettyOptions): Vuetty;
export function vuetty(component: Component, options?: VuettyOptions): Vuetty;

export class TUINode {
  constructor(type: string);
  [key: string]: any;
}
export class TextNode extends TUINode {}
export class CommentNode extends TUINode {}

export function createTUIRenderer(options?: Record<string, any>): any;
export function renderToString(root: any): string;

export const Box: DefineComponent<any, any, any>;
export const TextBox: DefineComponent<any, any, any>;
export const Row: DefineComponent<any, any, any>;
export const Col: DefineComponent<any, any, any>;
export const Divider: DefineComponent<any, any, any>;
export const Spacer: DefineComponent<any, any, any>;
export const Newline: DefineComponent<any, any, any>;
export const Spinner: DefineComponent<any, any, any>;
export const ProgressBar: DefineComponent<any, any, any>;
export const TextInput: DefineComponent<any, any, any>;
export const SelectInput: DefineComponent<any, any, any>;
export const Checkbox: DefineComponent<any, any, any>;
export const Radiobox: DefineComponent<any, any, any>;
export const Table: DefineComponent<any, any, any>;
export const Markdown: DefineComponent<any, any, any>;
export const Image: DefineComponent<any, any, any>;
export const BigText: DefineComponent<any, any, any>;
export const Gradient: DefineComponent<any, any, any>;
export const Button: DefineComponent<any, any, any>;
export const Tree: DefineComponent<any, any, any>;

export function clearBigTextCache(): void;
export function getBigTextCacheStats(): {
  figlet: { size: number; maxSize: number };
  final: { size: number; maxSize: number };
};

export function createTheme(userTheme?: Record<string, any>): Record<string, any>;
export const DEFAULT_THEME: Record<string, any>;
export function resolveThemeColor(
  theme: Record<string, any>,
  path: string
): string | null;

export const VUETTY_INPUT_MANAGER_KEY: string;
export const VUETTY_THEME_KEY: string;

export class RenderContext {
  constructor(options: any);
  [key: string]: any;
}
export class RenderHandler {
  render(ctx: RenderContext): string;
}
export const renderHandlerRegistry: {
  register(type: string, handler: RenderHandler): void;
  get(type: string): RenderHandler | null;
  has(type: string): boolean;
  unregister(type: string): void;
};
