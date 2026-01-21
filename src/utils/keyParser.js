// src/utils/keyParser.js

/**
 * Key constants for special keys
 */
export const KEY_UP = 'up';
export const KEY_DOWN = 'down';
export const KEY_LEFT = 'left';
export const KEY_RIGHT = 'right';
export const KEY_ENTER = 'enter';
export const KEY_BACKSPACE = 'backspace';
export const KEY_DELETE = 'delete';
export const KEY_TAB = 'tab';
export const KEY_ESCAPE = 'escape';
export const KEY_HOME = 'home';
export const KEY_END = 'end';
export const KEY_PAGEUP = 'pageup';
export const KEY_PAGEDOWN = 'pagedown';
export const KEY_CTRL_C = 'ctrl_c';
export const KEY_CTRL_D = 'ctrl_d';
export const KEY_CTRL_A = 'ctrl_a';
export const KEY_CTRL_E = 'ctrl_e';
export const KEY_CTRL_K = 'ctrl_k';
export const KEY_CTRL_W = 'ctrl_w';
export const KEY_CTRL_ENTER = 'ctrl_enter';

/**
 * ANSI escape code mapping to key names
 */
const ANSI_KEY_MAP = {
  // Arrow keys
  '\x1b[A': KEY_UP,
  '\x1b[B': KEY_DOWN,
  '\x1b[C': KEY_RIGHT,
  '\x1b[D': KEY_LEFT,

  // Shift + Arrow keys
  '\x1b[1;2A': KEY_UP,
  '\x1b[1;2B': KEY_DOWN,
  '\x1b[1;2C': KEY_RIGHT,
  '\x1b[1;2D': KEY_LEFT,

  // Function keys
  '\x1b[H': KEY_HOME,
  '\x1b[F': KEY_END,
  '\x1b[1~': KEY_HOME,
  '\x1b[4~': KEY_END,
  '\x1b[5~': KEY_PAGEUP,
  '\x1b[6~': KEY_PAGEDOWN,
  '\x1b[3~': KEY_DELETE,

  // Enter
  '\r': KEY_ENTER,
  '\n': KEY_ENTER,

  // Backspace
  '\x7f': KEY_BACKSPACE,
  '\x08': KEY_BACKSPACE,

  // Tab and Escape
  '\t': KEY_TAB,
  '\x1b': KEY_ESCAPE,

  // Control sequences
  '\x03': KEY_CTRL_C,
  '\x04': KEY_CTRL_D,
  '\x01': KEY_CTRL_A,
  '\x05': KEY_CTRL_E,
  '\x0b': KEY_CTRL_K,
  '\x17': KEY_CTRL_W,
  '\x1b\r': KEY_CTRL_ENTER,
  '\x1b\n': KEY_CTRL_ENTER,
};

/**
 * Parse a key input string into a normalized key object
 * NOTE: Only Ctrl and Shift modifiers are reliably detected across terminals.
 * Alt/Option produces special characters on Mac by default, but works as ESC prefix when
 * the terminal is configured with "Use Option as Meta key" setting.
 * Command/Meta is intercepted by the OS and never reaches the application.
 * @param {string} str - Raw input string from stdin
 * @returns {{key: string, char: string|null, ctrl: boolean, shift: boolean, alt: boolean}}
 */
export function parseKey(str) {
  // Parse ANSI modifier sequences like \x1b[1;5C (Ctrl+Right) or \x1b[1;2A (Shift+Up)
  // Format: \x1b[1;<modifier>X where modifier is:
  // 2 = Shift, 5 = Ctrl, 6 = Shift+Ctrl
  const modifierMatch = str.match(/^\x1b\[1;(\d+)([A-Z~])$/);
  if (modifierMatch) {
    const modCode = parseInt(modifierMatch[1], 10);
    const keyChar = modifierMatch[2];

    // Map key character to key name
    const keyMap = {
      'A': KEY_UP,
      'B': KEY_DOWN,
      'C': KEY_RIGHT,
      'D': KEY_LEFT,
      'H': KEY_HOME,
      'F': KEY_END,
    };

    const baseKey = keyMap[keyChar] || 'unknown';

    // Decode modifier bits (1-based, so subtract 1 to get 0-based bitmask)
    // modCode: 2=shift(1), 5=ctrl(4), 6=shift+ctrl(5)
    const modBits = modCode - 1;

    return {
      key: baseKey,
      char: null,
      shift: (modBits & 1) !== 0,
      ctrl: (modBits & 4) !== 0,
      alt: false
    };
  }

  // Check if it's a known ANSI sequence
  if (ANSI_KEY_MAP[str]) {
    const hasShiftModifier = str.includes(';2');
    // Shift+Enter sends \n (0x0a), Enter sends \r (0x0d)
    const isShiftEnter = str === '\n';

    return {
      key: ANSI_KEY_MAP[str],
      char: null,
      ctrl: false,
      shift: hasShiftModifier || isShiftEnter,
      alt: false
    };
  }

  // Check for Alt+printable (ESC followed by a single printable character)
  // This works when terminal is configured with "Use Option as Meta key"
  if (str.length === 2 && str.charCodeAt(0) === 0x1b) {
    const char = str[1];
    if (char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126) {
      return {
        key: char.toLowerCase(),  // Normalize to lowercase for easier matching
        char: char,
        ctrl: false,
        alt: true,
        shift: char !== char.toLowerCase()
      };
    }
  }

  // Check for control characters (Ctrl+A through Ctrl+Z, etc.)
  // ASCII codes 0x00-0x1F (0-31) are control characters
  if (str.length === 1 && str.charCodeAt(0) < 32) {
    return {
      key: 'char',
      char: str,
      ctrl: true,
      shift: false,
      alt: false
    };
  }

  // Check for printable characters (space to ~)
  if (str.length === 1 && str.charCodeAt(0) >= 32 && str.charCodeAt(0) <= 126) {
    return {
      key: 'char',
      char: str,
      ctrl: false,
      shift: str !== str.toLowerCase(),
      alt: false
    };
  }

  // Unicode characters (emoji, accented characters, etc.)
  if (str.length >= 1 && !str.startsWith('\x1b')) {
    return {
      key: 'char',
      char: str,
      ctrl: false,
      shift: false,
      alt: false
    };
  }

  // Unknown sequence - return raw
  return {
    key: 'unknown',
    char: str,
    ctrl: false,
    shift: false,
    alt: false
  };
}

/**
 * Check if a key is a printable character
 */
export function isPrintable(parsedKey) {
  return parsedKey.key === 'char' && parsedKey.char !== null;
}

/**
 * Check if a key is a navigation key
 */
export function isNavigation(parsedKey) {
  return [
    KEY_UP, KEY_DOWN, KEY_LEFT, KEY_RIGHT,
    KEY_HOME, KEY_END, KEY_PAGEUP, KEY_PAGEDOWN
  ].includes(parsedKey.key);
}

/**
 * Check if a key is a control key
 */
export function isControl(parsedKey) {
  return parsedKey.ctrl || parsedKey.key.startsWith('ctrl_');
}

/**
 * Mouse button constants
 */
const MOUSE_BUTTON = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
  WHEEL_UP: 64,
  WHEEL_DOWN: 65
};

/**
 * Mouse modifier bits
 */
const MOUSE_MOD = {
  SHIFT: 4,
  ALT: 8,
  CTRL: 16,
  MOTION: 32  // Set when mouse is moving (drag or wheel)
};

/**
 * Parse a mouse event from SGR or normal format
 * @param {string} str - Raw input string from stdin
 * @returns {{type: string, action: string, button: number, x: number, y: number, shift: boolean, ctrl: boolean, alt: boolean}|null}
 */
export function parseMouseEvent(str) {
  // SGR mouse format: \x1b[<button;x;y;M (press) or m (release)
  let match = str.match(/^\x1b\[<(\d+);(\d+);(\d+)([Mm])$/);
  let isSGR = true;

  // Normal/X10 extended format: \x1b[button;x;yM
  if (!match) {
    match = str.match(/^\x1b\[(\d+);(\d+);(\d+)M$/);
    isSGR = false;
    if (!match) {
      return null;
    }
  }

  const rawButton = parseInt(match[1], 10);
  const x = parseInt(match[2], 10);
  const y = parseInt(match[3], 10);
  const isRelease = isSGR && match[4] === 'm';

  // Extract modifiers
  const shift = (rawButton & MOUSE_MOD.SHIFT) !== 0;
  const alt = (rawButton & MOUSE_MOD.ALT) !== 0;
  const ctrl = (rawButton & MOUSE_MOD.CTRL) !== 0;
  const hasMotion = (rawButton & MOUSE_MOD.MOTION) !== 0;

  // Get base button (strip all modifier bits)
  const baseButton = rawButton & ~(MOUSE_MOD.SHIFT | MOUSE_MOD.ALT | MOUSE_MOD.CTRL | MOUSE_MOD.MOTION);

  // Determine action
  // IMPORTANT: Check wheel FIRST (highest priority), then drag, then clicks
  let action;

  // Wheel events: base button 64/65
  if (baseButton === MOUSE_BUTTON.WHEEL_UP) {
    action = 'wheel_up';
  } else if (baseButton === MOUSE_BUTTON.WHEEL_DOWN) {
    action = 'wheel_down';
  }
  // Drag events: motion bit set with a regular button (not wheel)
  // This MUST come before click detection!
  else if (hasMotion && baseButton <= MOUSE_BUTTON.RIGHT) {
    action = 'drag';
  }
  // Click events: no motion bit, regular buttons
  else if (baseButton === MOUSE_BUTTON.LEFT) {
    action = isRelease ? 'left_release' : 'left_click';
  } else if (baseButton === MOUSE_BUTTON.MIDDLE) {
    action = isRelease ? 'middle_release' : 'middle_click';
  } else if (baseButton === MOUSE_BUTTON.RIGHT) {
    action = isRelease ? 'right_release' : 'right_click';
  } else {
    action = 'unknown';
  }

  return {
    type: 'mouse',
    action,
    button: baseButton,
    x,
    y,
    shift,
    ctrl,
    alt
  };
}