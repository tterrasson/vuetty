import type { Component, DefineComponent, ComputedRef } from "vue";

// ============================================================================
// Core Options and Classes
// ============================================================================

export interface CacheOptions {
  layout?: {
    textMeasurement?: number;
    metricsPerNode?: number;
  };
  line?: {
    width?: number;
    truncateBuckets?: number;
    truncatePerBucket?: number;
  };
  effects?: {
    results?: number;
    parsedColors?: number;
    colorArrays?: number;
  };
  components?: {
    markdown?: {
      tokens?: number;
      maxTokens?: number;
      styles?: number;
    };
    bigText?: {
      figlet?: number;
      final?: number;
    };
    image?: {
      rendered?: number;
    };
    box?: {
      bufferPool?: number;
    };
  };
}

export interface VuettyOptions {
  theme?: Partial<Theme>;
  debugServer?: boolean | Record<string, any>;
  viewport?: Record<string, any>;
  forceColors?: boolean;
  scrollIndicatorMode?: string;
  cache?: CacheOptions;
  maxClickHandlers?: number;
  maxClickRegions?: number;
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

// ============================================================================
// Color Utilities
// ============================================================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export function parseColor(color: string): RGB | null;
export function interpolateColor(colors: string[], ratio: number, interpolation?: 'rgb' | 'hsv'): string;
export function adjustBrightness(color: RGB, factor: number): RGB;
export function hslToRgb(h: number, s: number, l: number): RGB;
export function rgbToHex(r: number, g: number, b: number): string;
export function rgbToHsl(r: number, g: number, b: number): HSL;

// ============================================================================
// Effect Registry
// ============================================================================

export interface EffectFunction {
  (text: string, effectProps: Record<string, any>, frame: number): string;
}

export interface EffectDefinition {
  fn: EffectFunction;
  animated: boolean;
  defaultInterval: number;
}

export const effectRegistry: {
  register(name: string, effectFn: EffectFunction, options?: { animated?: boolean; defaultInterval?: number }): void;
  get(name: string): EffectDefinition | null;
  has(name: string): boolean;
  unregister(name: string): void;
  getAll(): string[];
};

// ============================================================================
// Theme System
// ============================================================================

export interface ButtonVariantConfig {
  bg: string;
  color: string;
  bold: boolean;
  focusBg?: string;
}

export interface Theme {
  background?: string;
  foreground?: string;
  primary?: string;
  secondary?: string;
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  components?: {
    box?: {
      color?: string;
      bg?: string | null;
    };
    textBox?: {
      color?: string;
      bg?: string | null;
    };
    textInput?: {
      color?: string;
      borderColor?: string;
      bg?: string | null;
      focusColor?: string;
      errorColor?: string;
    };
    button?: {
      variants?: {
        primary?: ButtonVariantConfig;
        secondary?: ButtonVariantConfig;
        danger?: ButtonVariantConfig;
        warning?: ButtonVariantConfig;
        info?: ButtonVariantConfig;
        success?: ButtonVariantConfig;
      };
    };
    checkbox?: {
      color?: string;
      checkedColor?: string;
      uncheckedColor?: string;
    };
    radiobox?: {
      color?: string;
      selectedColor?: string;
      unselectedColor?: string;
    };
    tabs?: {
      focusColor?: string;
      activeColor?: string;
      highlightColor?: string;
    };
  };
  [key: string]: any; // Allow custom theme properties
}

export function createTheme(userTheme?: Partial<Theme>): Theme;
export const DEFAULT_THEME: Theme;
export function resolveThemeColor(theme: Theme, path: string): string | null;

// ============================================================================
// Layout Prop Interfaces
// ============================================================================

export interface FlexContainerProps {
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | null;
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' | null;
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around' | null;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse' | null;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse' | null;
  gap?: number | null;
}

export interface FlexItemProps {
  flex?: number | string | null;
  flexGrow?: number | null;
  flexShrink?: number | null;
  flexBasis?: number | string | null;
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' | null;
}

export interface DimensionProps {
  width?: number | string | null;
  height?: number | string | null;
  minWidth?: number | null;
  maxWidth?: number | null;
  minHeight?: number | null;
  maxHeight?: number | null;
}

export interface PaddingProps {
  padding?: number | null;
  paddingLeft?: number | null;
  paddingRight?: number | null;
  paddingTop?: number | null;
  paddingBottom?: number | null;
}

export interface MarginProps {
  margin?: number | null;
  marginLeft?: number | null;
  marginRight?: number | null;
  marginTop?: number | null;
  marginBottom?: number | null;
}

export type BoxProps = FlexItemProps & DimensionProps & PaddingProps & MarginProps;
export type LayoutProps = FlexContainerProps & FlexItemProps & DimensionProps & PaddingProps & MarginProps;

export interface StyleProps {
  color?: string;
  bg?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  dim?: boolean;
}

// ============================================================================
// Component Prop Interfaces
// ============================================================================

// Layout Components
export interface RowProps extends LayoutProps {
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: number;
  responsive?: boolean;
}

export interface ColProps extends LayoutProps {
  flex?: number | string;
  gap?: number;
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  responsive?: boolean;
}

// Visual Container Components
export type BorderStyle =
  | 'rounded'
  | 'square'
  | 'double'
  | 'classic'
  | 'bold'
  | 'dashed'
  | 'sparse'
  | 'light'
  | 'button'
  | {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
};

export interface BoxComponentProps extends BoxProps, StyleProps {
  border?: boolean;
  borderStyle?: BorderStyle;
  title?: string | null;
  titleAlign?: 'left' | 'center' | 'right';
  titlePadding?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TextBoxProps extends BoxProps, StyleProps {
  effect?: string | null;
  effectProps?: Record<string, any> | null;
  animated?: boolean;
  animationInterval?: number | null;
}

// Simple Display Components
export interface DividerProps extends BoxProps, Pick<StyleProps, 'color'> {
  char?: string;
  length?: number;
}

export interface SpacerProps {
  count?: number;
}

export interface NewlineProps {
  count?: number;
}

// Interactive Input Components
export interface TextInputProps extends BoxProps, StyleProps {
  modelValue?: string;
  multiline?: boolean;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  autoResize?: boolean;
  wrapLines?: boolean;
  label?: string;
  placeholder?: string;
  hint?: string | boolean;
  borderColor?: string;
  focusColor?: string;
  errorColor?: string;
  pattern?: RegExp;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
  readonly?: boolean;
}

export interface ListItem {
  value?: any;
  label?: string;
  disabled?: boolean;
}

export interface SelectInputProps extends BoxProps, Pick<StyleProps, 'color' | 'bg' | 'bold' | 'dim'> {
  modelValue?: any | any[];
  options?: Array<ListItem | string | number>;
  label?: string;
  height?: number;
  marker?: string;
  highlightMarker?: string;
  disabled?: boolean;
  multiple?: boolean;
  focusColor?: string;
  selectedColor?: string;
  highlightColor?: string;
  hint?: string | boolean;
}

export interface ListComponentProps extends BoxProps, Pick<StyleProps, 'color' | 'bg' | 'bold' | 'dim'> {
  items?: Array<ListItem | string | number>;
  label?: string;
  marker?: string;
  highlightedValue?: string | number | object | null;
  highlightColor?: string;
}

export interface CheckboxProps extends BoxProps, Pick<StyleProps, 'color' | 'bg' | 'bold' | 'dim'> {
  modelValue?: any[];
  options?: Array<ListItem | string | number>;
  label?: string;
  direction?: 'vertical' | 'horizontal';
  height?: number;
  itemSpacing?: number;
  disabled?: boolean;
  focusColor?: string;
  selectedColor?: string;
  highlightColor?: string;
  hint?: string | boolean;
}

export interface RadioboxProps extends BoxProps, Pick<StyleProps, 'color' | 'bg' | 'bold' | 'dim'> {
  modelValue?: string | number | object | null;
  options?: Array<ListItem | string | number>;
  label?: string;
  direction?: 'vertical' | 'horizontal';
  height?: number;
  itemSpacing?: number;
  disabled?: boolean;
  focusColor?: string;
  selectedColor?: string;
  highlightColor?: string;
  hint?: string | boolean;
}

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'success';

export interface ButtonComponentProps extends BoxProps, Pick<StyleProps, 'bold' | 'italic' | 'dim'> {
  label: string;
  variant?: ButtonVariant;
  color?: string;
  bg?: string;
  disabled?: boolean;
  focusColor?: string;
  focusBg?: string | null;
  fullWidth?: boolean;
}

export interface TabItem {
  value?: any;
  label?: string;
  disabled?: boolean;
}

export interface TabsProps extends BoxProps, Pick<StyleProps, 'color' | 'bg'> {
  modelValue?: string | number | null;
  tabs: Array<TabItem | string | number>;
  disabled?: boolean;
  focusColor?: string;
  activeColor?: string;
  highlightColor?: string;
  panelBorder?: boolean;
  panelBorderStyle?: string;
  panelPadding?: number;
  hint?: string | boolean;
}

export interface TableProps extends BoxProps, Pick<StyleProps, 'color' | 'bg' | 'bold' | 'dim'> {
  modelValue?: number | null;
  headers?: any[];
  rows?: any[][];
  label?: string;
  height?: number;
  columnWidths?: number[] | null;
  striped?: boolean;
  showHeader?: boolean;
  disabled?: boolean;
  focusColor?: string;
  selectedColor?: string;
  highlightColor?: string;
  headerColor?: string;
  stripedColor?: string;
  hint?: string | boolean;
}

// Display Components
export type SpinnerType = 'dots' | 'line' | 'arc' | 'arrow' | 'bounce' | 'clock' | 'box';

export interface SpinnerProps extends BoxProps, StyleProps {
  type?: SpinnerType;
  modelValue?: boolean;
  interval?: number;
  label?: string;
  labelPosition?: 'left' | 'right';
}

export interface ProgressBarProps extends BoxProps, StyleProps {
  value?: number;
  max?: number;
  char?: string;
  emptyChar?: string;
  showPercentage?: boolean;
  label?: string;
  labelPosition?: 'left' | 'right' | 'above' | 'below';
  brackets?: boolean;
  emptyColor?: string;
  percentageColor?: string;
}

export interface GradientProps extends BoxProps {
  name?: string | null;
  colors?: string[] | null;
  interpolation?: 'rgb' | 'hsv';
}

export interface BigTextProps extends BoxProps, StyleProps {
  font?: string;
  horizontalLayout?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TreeNode {
  name: string;
  children?: TreeNode[];
  [key: string]: any;
}

export interface TreeProps extends BoxProps, Pick<StyleProps, 'color' | 'bg'> {
  data?: TreeNode[];
  branchColor?: string;
  folderColor?: string;
  fileColor?: string | null;
  showIcons?: boolean;
  treeStyle?: string | Record<string, string>;
}

export interface MarkdownProps extends BoxProps, StyleProps {
  source?: string;
  codeTheme?: string;
  enableTables?: boolean;
  enableLists?: boolean;
  enableCodeBlocks?: boolean;
}

export interface ImageProps extends BoxProps {
  src: string | Buffer;
  width?: number | string | null;
  height?: number | string | null;
  preserveAspectRatio?: boolean;
  alt?: string;
  errorColor?: string;
  errorBorderStyle?: string;
}

// ============================================================================
// Component Exports
// ============================================================================

export const Box: DefineComponent<BoxComponentProps>;
export const TextBox: DefineComponent<TextBoxProps>;
export const Row: DefineComponent<RowProps>;
export const Col: DefineComponent<ColProps>;
export const Divider: DefineComponent<DividerProps>;
export const Spacer: DefineComponent<SpacerProps>;
export const Newline: DefineComponent<NewlineProps>;
export const Spinner: DefineComponent<SpinnerProps>;
export const ProgressBar: DefineComponent<ProgressBarProps>;
export const TextInput: DefineComponent<TextInputProps>;
export const SelectInput: DefineComponent<SelectInputProps>;
export const Checkbox: DefineComponent<CheckboxProps>;
export const Radiobox: DefineComponent<RadioboxProps>;
export const Table: DefineComponent<TableProps>;
export const Markdown: DefineComponent<MarkdownProps>;
export const Image: DefineComponent<ImageProps>;
export const BigText: DefineComponent<BigTextProps>;
export const Gradient: DefineComponent<GradientProps>;
export const Button: DefineComponent<ButtonComponentProps>;
export const Tree: DefineComponent<TreeProps>;
export const List: DefineComponent<ListComponentProps>;
export const Tabs: DefineComponent<TabsProps>;

// ============================================================================
// BigText Utilities
// ============================================================================

export function clearBigTextCache(): void;
export function getBigTextCacheStats(): {
  figlet: { size: number; maxSize: number };
  final: { size: number; maxSize: number };
};

// ============================================================================
// Injection Keys
// ============================================================================

export const VUETTY_INPUT_MANAGER_KEY: string;
export const VUETTY_THEME_KEY: string;
export const VUETTY_RENDERER_KEY: string;
export const VUETTY_ROUTER_KEY: string;
export const VUETTY_VIEWPORT_STATE_KEY: string;
export const VUETTY_INSTANCE_KEY: string;

// ============================================================================
// Render Handler System
// ============================================================================

export interface RenderContextOptions {
  node: any;
  depth: number;
  absX: number;
  absY: number;
  inRow: boolean;
  renderNodeFn: (node: any, depth: number, options: any) => string;
}

export interface RenderChildOptions {
  parentAbsX?: number;
  yOffset?: number;
  inRow?: boolean;
}

export class RenderContext {
  node: any;
  depth: number;
  absX: number;
  absY: number;
  inRow: boolean;

  constructor(options: RenderContextOptions);

  get props(): Record<string, any>;
  get text(): string;
  get children(): any[];
  get metrics(): any;

  getEffectiveWidth(): number | null;
  renderChild(child: any, options?: RenderChildOptions): string;
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

// ============================================================================
// Theme Composable
// ============================================================================

export interface UseThemeReturn {
  theme: ComputedRef<Theme | null>;
  themeName: ComputedRef<string | null>;
  isThemeSet: ComputedRef<boolean>;
  setTheme: (themeName: string) => void;
  getTheme: (themeName: string) => Theme | null;
  listThemes: () => string[];
  getAllThemes: () => Record<string, Theme>;
  findThemes: (pattern: string) => Array<{ name: string; theme: Theme }>;
}

export function useTheme(): UseThemeReturn;
