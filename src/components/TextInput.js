// src/components/TextInput.js
import { inject, onUnmounted, watch, computed, reactive, h } from 'vue';
import chalk from 'chalk';
import { VUETTY_INPUT_MANAGER_KEY, VUETTY_INSTANCE_KEY, VUETTY_THEME_KEY, VUETTY_VIEWPORT_STATE_KEY } from '@core/vuettyKeys.js';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
import {
  KEY_LEFT,
  KEY_RIGHT,
  KEY_BACKSPACE,
  KEY_DELETE,
  KEY_ENTER,
  KEY_HOME,
  KEY_END,
  KEY_CTRL_A,
  KEY_CTRL_E,
  KEY_CTRL_D,
  KEY_UP,
  KEY_DOWN,
  KEY_CTRL_ENTER,
  isPrintable
} from '@utils/keyParser.js';
import { getChalkColor, getAnsiBgCode } from '@utils/colorUtils.js';
import { boxProps } from '@core/layoutProps.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

// Counter-based ID instead of Math.random()
let componentIdCounter = 0;

// Pool for visual lines arrays
const visualLinesPool = [];
const MAX_POOL_SIZE = 5;

function getVisualLinesArray() {
  return visualLinesPool.pop() || [];
}

function releaseVisualLinesArray(arr) {
  arr.length = 0;
  if (visualLinesPool.length < MAX_POOL_SIZE) {
    visualLinesPool.push(arr);
  }
}

// Pre-computed border characters
const BORDER = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│'
};


// Set for faster ctrl code lookup
const ALLOWED_CTRL_CODES = new Set([
  0x01, // Ctrl+A
  0x05, // Ctrl+E
  0x04, // Ctrl+D
  0x0b, // Ctrl+K
  0x17, // Ctrl+W
  0x0d, // Ctrl+Enter (CR)
  0x0a  // Ctrl+Enter (LF)
]);

/**
 * TextInput component
 * Counter ID, cached colors, pooled arrays
 */
export default {
  name: 'TextInput',
  props: {
    modelValue: { type: String, default: '' },
    multiline: { type: Boolean, default: false },
    rows: { type: Number, default: 3 },
    minRows: { type: Number, default: 1 },
    maxRows: { type: Number, default: undefined },
    autoResize: { type: Boolean, default: true },
    wrapLines: { type: Boolean, default: true },
    label: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    hint: { type: [String, Boolean], default: 'default' },
    color: String,
    borderColor: String,
    bg: String,
    focusColor: { type: String, default: 'cyan' },
    errorColor: { type: String, default: 'red' },
    bold: Boolean,
    italic: Boolean,
    dim: Boolean,
    pattern: RegExp,
    required: Boolean,
    maxLength: Number,
    disabled: Boolean,
    readonly: Boolean,
    // Include common layout props (padding, margin, dimensions)
    ...boxProps
  },

  emits: ['update:modelValue', 'change', 'focus', 'blur', 'validate'],

  setup(props, { emit }) {
    const inputManager = inject(VUETTY_INPUT_MANAGER_KEY);
    const vuettyInstance = inject(VUETTY_INSTANCE_KEY, null);
    const theme = inject(VUETTY_THEME_KEY, null);
    const viewportState = inject(VUETTY_VIEWPORT_STATE_KEY, null);
    const injectedWidthContext = inject(WIDTH_CONTEXT_KEY, null);
    const componentId = `textinput-${++componentIdCounter}`;

    const state = reactive({
      text: props.modelValue || '',
      cursor: (props.modelValue || '').length,
      scrollOffset: 0,
      validationError: null,
      isFocused: false
    });

    let lastEmittedValue = props.modelValue || '';

    // Compute effective width for internal calculations (content width, not including borders)
    const getEffectiveWidth = () => {
      // Resolve injected width from layout context
      const injectedWidth = typeof injectedWidthContext === 'function'
        ? injectedWidthContext()
        : injectedWidthContext;

      // Determine base width: explicit width prop, or injected width, or default 40
      let baseWidth;
      if (props.width !== undefined && props.width !== null) {
        baseWidth = props.width;
      } else if (injectedWidth !== undefined && injectedWidth !== null) {
        // injectedWidth comes from parent context (Box provides content width)
        baseWidth = injectedWidth;
      } else {
        baseWidth = 40;
      }

      // TextInput has borders (1 left + 1 right = 2 columns)
      // If baseWidth is not from explicit width prop but from computed layout,
      // we need to subtract borders to get content width
      // Explicit width prop already represents content width
      return baseWidth;
    };

    function emitUpdate() {
      if (state.text !== lastEmittedValue) {
        lastEmittedValue = state.text;
        emit('update:modelValue', state.text);
      }
    }

    function afterEdit() {
      if (state.cursor > state.text.length) {
        state.cursor = state.text.length;
      } else if (state.cursor < 0) {
        state.cursor = 0;
      }
      validate();
      updateScroll();
      emitUpdate();
    }

    const isFocused = computed(() => inputManager && inputManager.isFocused(componentId));

    watch(isFocused, (newVal) => {
      state.isFocused = newVal;
      if (newVal) emit('focus');
      else emit('blur');
    });

    function validate() {
      const errors = [];
      const val = state.text;

      if (props.required && !val.trim()) errors.push('Required');
      if (props.maxLength && val.length > props.maxLength) errors.push(`Max ${props.maxLength}`);
      if (props.pattern && !props.pattern.test(val)) errors.push('Invalid format');

      const valid = errors.length === 0;
      state.validationError = valid ? null : errors[0];
      emit('validate', { valid, errors });
      return valid;
    }

    function getCursorVisualPosition() {
      const effectiveWidth = getEffectiveWidth();
      const lines = wrapTextWithIndices(state.text, effectiveWidth);
      const cursor = state.cursor;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (cursor >= line.startIndex && cursor <= line.endIndex) {
          const isFullLine = line.text.length >= effectiveWidth;

          if (cursor === line.endIndex && isFullLine && i < lines.length - 1) {
            continue;
          }

          if (cursor === line.endIndex && isFullLine && i === lines.length - 1) {
            return { row: i + 1, col: 0, visualLines: lines };
          }

          return { row: i, col: cursor - line.startIndex, visualLines: lines };
        }
      }

      const lastLine = lines[lines.length - 1] || { text: '', startIndex: 0 };
      return { row: lines.length - 1, col: cursor - lastLine.startIndex, visualLines: lines };
    }

    function updateScroll() {
      const { row, visualLines } = getCursorVisualPosition();

      let visibleRows = props.rows;
      if (props.autoResize) {
        visibleRows = Math.max(props.minRows, visualLines.length);
        if (props.maxRows) visibleRows = Math.min(visibleRows, props.maxRows);
      }

      if (row < state.scrollOffset) {
        state.scrollOffset = row;
      } else if (row >= state.scrollOffset + visibleRows) {
        state.scrollOffset = row - visibleRows + 1;
      }

      if (state.scrollOffset > 0) {
        const maxScroll = Math.max(0, visualLines.length - visibleRows);
        if (state.scrollOffset > maxScroll) {
          state.scrollOffset = maxScroll;
        }
      }

      releaseVisualLinesArray(visualLines);
    }

    function moveCursorVisual(delta) {
      const { row, col, visualLines } = getCursorVisualPosition();
      const targetRow = row + delta;

      if (targetRow >= 0 && targetRow < visualLines.length) {
        const targetLine = visualLines[targetRow];
        const newCol = Math.min(col, targetLine.text.length);
        state.cursor = targetLine.startIndex + newCol;
      }

      releaseVisualLinesArray(visualLines);
    }

    function handleKey(parsedKey) {
      if (props.disabled || props.readonly) return false;

      const { key, char } = parsedKey;
      const text = state.text;

      // Handle Ctrl sequences
      if (parsedKey.ctrl && char) {
        const code = char.charCodeAt(0);
        if (code < 32 && !ALLOWED_CTRL_CODES.has(code)) {
          return true;
        }
      }

      // Navigation
      if (key === KEY_LEFT) {
        if (state.cursor > 0) state.cursor--;
        afterEdit();
        return true;
      }
      if (key === KEY_RIGHT) {
        if (state.cursor < text.length) state.cursor++;
        afterEdit();
        return true;
      }
      if (key === KEY_UP) {
        moveCursorVisual(-1);
        afterEdit();
        return true;
      }
      if (key === KEY_DOWN) {
        moveCursorVisual(1);
        afterEdit();
        return true;
      }
      if (key === KEY_HOME || key === KEY_CTRL_A) {
        const lastNewline = text.lastIndexOf('\n', state.cursor - 1);
        state.cursor = lastNewline === -1 ? 0 : lastNewline + 1;
        afterEdit();
        return true;
      }
      if (key === KEY_END || key === KEY_CTRL_E) {
        const nextNewline = text.indexOf('\n', state.cursor);
        state.cursor = nextNewline === -1 ? text.length : nextNewline;
        afterEdit();
        return true;
      }

      // Editing
      if (key === KEY_BACKSPACE) {
        if (state.cursor > 0) {
          const pos = state.cursor;
          state.text = text.slice(0, pos - 1) + text.slice(pos);
          state.cursor--;
        }
        afterEdit();
        return true;
      }
      if (key === KEY_DELETE || key === KEY_CTRL_D) {
        if (state.cursor < text.length) {
          const pos = state.cursor;
          state.text = text.slice(0, pos) + text.slice(pos + 1);
        }
        afterEdit();
        return true;
      }
      if (key === KEY_ENTER) {
        if (props.multiline && parsedKey.shift) {
          const pos = state.cursor;
          state.text = text.slice(0, pos) + '\n' + text.slice(pos);
          state.cursor++;
        } else {
          emit('change', state.text);
        }
        afterEdit();
        return true;
      }
      if (key === KEY_CTRL_ENTER) {
        emit('change', state.text);
        afterEdit();
        return true;
      }
      if (isPrintable(parsedKey)) {
        if (props.maxLength && text.length >= props.maxLength) return true;

        const pos = state.cursor;
        state.text = text.slice(0, pos) + char + text.slice(pos);
        state.cursor += char.length;
        afterEdit();
        return true;
      }

      return false;
    }

    function handleClick(mouseEvent) {
      if (props.disabled || props.readonly) return;
      inputManager.focus(componentId);
    }

    inputManager.registerComponent(componentId, handleKey, { disabled: props.disabled });

    if (vuettyInstance) {
      vuettyInstance.registerClickHandler(componentId, handleClick);
    }

    onUnmounted(() => {
      if (inputManager) inputManager.unregisterComponent(componentId);
      if (vuettyInstance) vuettyInstance.unregisterClickHandler(componentId);
    });

    watch(() => props.disabled, (val) => {
      inputManager.setComponentDisabled(componentId, val);
    });

    watch(() => props.modelValue, (newValue) => {
      const normalizedNew = newValue || '';
      if (normalizedNew !== state.text) {
        state.text = normalizedNew;
        state.cursor = Math.min(state.cursor, state.text.length);
        lastEmittedValue = normalizedNew;
        validate();
        updateScroll();
      }
    }, { immediate: true });

    // Cache props object
    let cachedProps = null;
    let lastStateSnapshot = '';
    let lastInjectedWidth = undefined;
    let lastViewportVersion = -1;

    return () => {
      const stateSnapshot = `${state.text}:${state.cursor}:${state.scrollOffset}:${state.isFocused}:${state.validationError}`;

      // Resolve width context
      const injectedWidth = typeof injectedWidthContext === 'function'
        ? injectedWidthContext()
        : injectedWidthContext;

      const viewportVersion = viewportState ? viewportState.version : 0;

      if (stateSnapshot !== lastStateSnapshot || injectedWidth !== lastInjectedWidth || viewportVersion !== lastViewportVersion || !cachedProps) {
        lastStateSnapshot = stateSnapshot;
        lastInjectedWidth = injectedWidth;
        lastViewportVersion = viewportVersion;

        // Resolve colors from theme if not provided in props
        const effectiveFocusColor = props.focusColor || theme?.components?.textInput?.focusColor || 'cyan';
        const effectiveErrorColor = props.errorColor || theme?.components?.textInput?.errorColor || 'red';
        const effectiveColor = props.color !== undefined ? props.color : theme?.components?.textInput?.color;
        const effectiveBorderColor = props.borderColor !== undefined
          ? props.borderColor
          : (theme?.components?.textInput?.borderColor ?? theme?.components?.textInput?.color);
        const effectiveBg = props.bg !== undefined ? props.bg : (theme?.components?.textInput?.bg ?? theme?.background);

        // Build props object - only pass width if explicitly defined by user
        // This allows render.js to inject computed width from layout
        cachedProps = {
          multiline: props.multiline,
          rows: props.rows,
          minRows: props.minRows,
          maxRows: props.maxRows,
          autoResize: props.autoResize,
          wrapLines: props.wrapLines,
          label: props.label,
          placeholder: props.placeholder,
          hint: props.hint,
          color: effectiveColor,
          borderColor: effectiveBorderColor,
          bg: effectiveBg,
          focusColor: effectiveFocusColor,
          errorColor: effectiveErrorColor,
          bold: props.bold,
          italic: props.italic,
          dim: props.dim,
          disabled: props.disabled,
          readonly: props.readonly,
          _componentId: componentId,
          _clickable: true,
          text: state.text,
          cursor: state.cursor,
          scrollOffset: state.scrollOffset,
          isFocused: state.isFocused,
          validationError: state.validationError,
          _injectedWidth: injectedWidth,
          _viewportVersion: viewportVersion
        };

        // Only add width if explicitly set by user
        if (props.width !== undefined && props.width !== null) {
          cachedProps.width = props.width;
        }
      }

      return h('textinput', cachedProps);
    };
  }
};

/**
 * Helper: Split text into visual lines based on width
 */
function wrapTextWithIndices(text, width) {
  const visualLines = getVisualLinesArray();
  const logicalLines = text.split('\n');

  let globalIndex = 0;

  for (let i = 0; i < logicalLines.length; i++) {
    const line = logicalLines[i];

    if (line.length === 0) {
      visualLines.push({
        text: '',
        startIndex: globalIndex,
        endIndex: globalIndex
      });
      globalIndex += 1;
      continue;
    }

    let remaining = line;
    let lineStartIndex = globalIndex;

    while (remaining.length > 0) {
      let chunk;
      let wrapLen;

      if (remaining.length <= width) {
        chunk = remaining;
        wrapLen = chunk.length;
      } else {
        let breakPoint = width;
        const lastSpace = remaining.lastIndexOf(' ', width);

        if (lastSpace > width * 0.3) {
          breakPoint = lastSpace + 1;
        }

        chunk = remaining.slice(0, breakPoint);
        wrapLen = chunk.length;
      }

      visualLines.push({
        text: chunk,
        startIndex: lineStartIndex,
        endIndex: lineStartIndex + wrapLen
      });

      lineStartIndex += wrapLen;
      remaining = remaining.slice(wrapLen);
    }

    globalIndex += line.length + 1;
  }

  return visualLines;
}

/**
 * Preserve background color across ANSI resets in content
 * Replaces \x1b[0m with \x1b[0m + bgCode to maintain background
 */
function preserveBackground(content, bgCode) {
  if (!bgCode || !content) return content;
  return content.replace(/\x1b\[0m/g, '\x1b[0m' + bgCode);
}

/**
 * Rendering Logic
 */
export function renderTextInput(props) {
  let {
    text = '',
    width,
    _injectedWidth,
    rows = 3,
    minRows = 1,
    maxRows,
    autoResize = false,
    cursor = 0,
    scrollOffset = 0,
    label = '',
    placeholder = '',
    isFocused = false,
    validationError = null,
    disabled = false,
    color,
    borderColor,
    bg,
    focusColor = 'cyan',
    errorColor = 'red',
    multiline = false,
    hint = 'default'
  } = props;

  if (text === null || text === undefined) text = '';
  else text = String(text);

  // Determine effective width: explicit width takes precedence, then injected, fallback to 40
  const effectiveWidth = width !== undefined && width !== null
    ? width
    : (_injectedWidth !== undefined && _injectedWidth !== null ? _injectedWidth : 40);

  const lines = [];

  // 1. Label
  if (label) {
    const labelStyle = isFocused ? chalk.bold : (s => s);
    lines.push(labelStyle(label));
  }

  // 2. Border color: error > focus > user color > default
  let resolvedBorderColor = borderColor || 'white';
  if (validationError) resolvedBorderColor = errorColor;
  else if (isFocused) resolvedBorderColor = focusColor;

  // 3. Border style (foreground color only)
  const borderStyle = getChalkColor(resolvedBorderColor);

  // 4. Content style (foreground color only)
  const contentStyle = color ? getChalkColor(color) : chalk;

  // 5. Background ANSI code (no reset) for stable bg across resets
  const bgAnsi = getAnsiBgCode(bg);
  const bgStr = bgAnsi || '';
  const wrapBgLine = (line) => bgAnsi ? (bgStr + preserveBackground(line, bgAnsi) + '\x1b[0m') : line;

  // Top border
  lines.push(wrapBgLine(borderStyle(BORDER.topLeft + BORDER.horizontal.repeat(effectiveWidth) + BORDER.topRight)));

  // Content (Wrapped)
  const visualLines = wrapTextWithIndices(text, effectiveWidth);

  // Calculate cursor visual position
  let cursorRow = -1;
  let cursorCol = -1;

  for (let i = 0; i < visualLines.length; i++) {
    const line = visualLines[i];
    if (cursor >= line.startIndex && cursor <= line.endIndex) {
      const isFullLine = line.text.length >= effectiveWidth;

      if (cursor === line.endIndex && isFullLine && i < visualLines.length - 1) {
        continue;
      }

      if (cursor === line.endIndex && isFullLine && i === visualLines.length - 1) {
        cursorRow = i + 1;
        cursorCol = 0;
      } else {
        cursorRow = i;
        cursorCol = cursor - line.startIndex;
      }
      break;
    }
  }

  // Calculate Effective Rows
  let effectiveRows = rows;
  if (autoResize) {
    let contentHeight = visualLines.length;
    if (cursorRow === visualLines.length) {
      contentHeight++;
    }

    effectiveRows = Math.max(minRows, contentHeight);
    if (maxRows) effectiveRows = Math.min(effectiveRows, maxRows);
  }

  // Viewport content
  const focusStyle = getChalkColor(focusColor);

  for (let i = 0; i < effectiveRows; i++) {
    const rowIndex = scrollOffset + i;

    let content = rowIndex < visualLines.length ? visualLines[rowIndex].text : '';
    const paddedContent = content.padEnd(effectiveWidth);
    let innerContent;

    if (isFocused && !disabled && rowIndex === cursorRow) {
      const c = Math.min(cursorCol, effectiveWidth - 1);

      if (text.length === 0 && placeholder && rowIndex === 0) {
        innerContent = focusStyle.inverse(placeholder[0] || ' ') +
          contentStyle.dim(placeholder.slice(1).padEnd(effectiveWidth - 1));
      } else {
        const char = paddedContent[c] || ' ';
        const before = paddedContent.slice(0, c);
        const after = paddedContent.slice(c + 1);
        innerContent = contentStyle(before) +
          focusStyle.inverse(char) +
          contentStyle(after);
      }
    } else if (text.length === 0 && placeholder && rowIndex === 0) {
      innerContent = contentStyle.dim(placeholder.padEnd(effectiveWidth));
    } else {
      innerContent = contentStyle(paddedContent);
    }

    // Build full line with bg wrapper for uniform background
    lines.push(wrapBgLine(borderStyle(BORDER.vertical) + innerContent + borderStyle(BORDER.vertical)));
  }

  // Release the visual lines array back to pool
  releaseVisualLinesArray(visualLines);

  // Bottom border
  lines.push(wrapBgLine(borderStyle(BORDER.bottomLeft + BORDER.horizontal.repeat(effectiveWidth) + BORDER.bottomRight)));

  // Validation / Hints
  if (validationError) {
    lines.push(getChalkColor(errorColor)('✗ ' + validationError));
  } else if (isFocused && !disabled) {
    let hintText = '';

    if (hint === 'default') {
      hintText = multiline ? 'Enter to submit, Shift+Enter for new line' : 'Enter to submit';
    } else if (hint && hint !== false && hint !== '') {
      hintText = hint;
    }

    if (hintText) {
      lines.push(contentStyle.dim(hintText));
    }
  }

  return lines.join('\n');
}

/**
 * Render handler for textinput
 */
class TextInputRenderHandler extends RenderHandler {
  render(ctx) {
    const { node } = ctx;
    const width = ctx.getEffectiveWidth();

    if (width !== null) {
      node.props.width = Math.max(1, width - 2);
    }

    const output = renderTextInput(ctx.props);

    if (width !== null) {
      delete node.props.width;
    }

    return output;
  }
}

renderHandlerRegistry.register('textinput', new TextInputRenderHandler());
