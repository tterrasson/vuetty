import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { InputManager } from '../../src/core/inputManager.js';

const STDIN_KEYS = [
  'isTTY',
  'setRawMode',
  'resume',
  'pause',
  'setEncoding',
  'on',
  'removeListener'
];

function setStdinProp(key, value) {
  try {
    Object.defineProperty(process.stdin, key, {
      value,
      configurable: true,
      writable: true
    });
  } catch {
    process.stdin[key] = value;
  }
}

describe('InputManager integration behavior', () => {
  const originalDescriptors = {};

  beforeEach(() => {
    for (const key of STDIN_KEYS) {
      originalDescriptors[key] = Object.getOwnPropertyDescriptor(process.stdin, key);
    }
  });

  afterEach(() => {
    for (const key of STDIN_KEYS) {
      const descriptor = originalDescriptors[key];
      try {
        if (descriptor) {
          Object.defineProperty(process.stdin, key, descriptor);
        } else {
          delete process.stdin[key];
        }
      } catch {
        // Best-effort restore for environments with restricted descriptors
      }
    }
  });

  test('enable/disable configures stdin raw mode lifecycle when TTY', () => {
    const setRawMode = mock(() => {});
    const resume = mock(() => {});
    const pause = mock(() => {});
    const setEncoding = mock(() => {});
    const on = mock(() => {});
    const removeListener = mock(() => {});

    setStdinProp('isTTY', true);
    setStdinProp('setRawMode', setRawMode);
    setStdinProp('resume', resume);
    setStdinProp('pause', pause);
    setStdinProp('setEncoding', setEncoding);
    setStdinProp('on', on);
    setStdinProp('removeListener', removeListener);

    const manager = new InputManager();
    manager.enable();

    expect(manager.enabled).toBe(true);
    expect(setRawMode).toHaveBeenCalledWith(true);
    expect(resume).toHaveBeenCalledTimes(1);
    expect(setEncoding).toHaveBeenCalledWith('utf8');
    expect(on).toHaveBeenCalledWith('data', manager.handleData);

    manager.disable();

    expect(manager.enabled).toBe(false);
    expect(removeListener).toHaveBeenCalledWith('data', manager.handleData);
    expect(pause).toHaveBeenCalledTimes(1);
    expect(setRawMode).toHaveBeenCalledWith(false);
  });

  test('enable/disable are idempotent and skip raw mode when not TTY', () => {
    const setRawMode = mock(() => {});
    const resume = mock(() => {});
    const pause = mock(() => {});
    const setEncoding = mock(() => {});
    const on = mock(() => {});
    const removeListener = mock(() => {});

    setStdinProp('isTTY', false);
    setStdinProp('setRawMode', setRawMode);
    setStdinProp('resume', resume);
    setStdinProp('pause', pause);
    setStdinProp('setEncoding', setEncoding);
    setStdinProp('on', on);
    setStdinProp('removeListener', removeListener);

    const manager = new InputManager();

    manager.enable();
    manager.enable();

    expect(resume).toHaveBeenCalledTimes(1);
    expect(on).toHaveBeenCalledTimes(1);
    expect(setRawMode).not.toHaveBeenCalled();

    manager.disable();
    manager.disable();
    expect(removeListener).toHaveBeenCalledTimes(1);
    expect(pause).toHaveBeenCalledTimes(1);
  });

  test('handleData tokenizes plain chars and escape pairs', () => {
    const manager = new InputManager();
    manager.handleKeyPress = mock(() => {});

    manager.handleData('ab');
    manager.handleData('\x1bx');

    expect(manager.handleKeyPress.mock.calls.map(c => c[0])).toEqual(['a', 'b', '\x1bx']);
    expect(manager.buffer).toBe('');
  });

  test('handleData buffers incomplete SGR mouse sequences then flushes once complete', () => {
    const manager = new InputManager();
    manager.handleMouseEvent = mock(() => {});
    manager.handleKeyPress = mock(() => {});

    manager.handleData('\x1b[<0;10;');
    expect(manager.handleMouseEvent).not.toHaveBeenCalled();
    expect(manager.buffer).toBe('\x1b[<0;10;');

    manager.handleData('5MZ');

    expect(manager.handleMouseEvent).toHaveBeenCalledWith('\x1b[<0;10;5M');
    expect(manager.handleKeyPress).toHaveBeenCalledWith('Z');
    expect(manager.buffer).toBe('');
  });

  test('handleData routes normal mouse and CSI key sequences', () => {
    const manager = new InputManager();
    manager.handleMouseEvent = mock(() => {});
    manager.handleKeyPress = mock(() => {});

    manager.handleData('\x1b[65;10;11M');
    manager.handleData('\x1b[1;2A');

    expect(manager.handleMouseEvent).toHaveBeenCalledWith('\x1b[65;10;11M');
    expect(manager.handleKeyPress).toHaveBeenCalledWith('\x1b[1;2A');
  });

  test('handleData handles lone and incomplete ESC sequences safely', () => {
    const manager = new InputManager();
    manager.handleKeyPress = mock(() => {});

    manager.handleData('\x1b');
    expect(manager.handleKeyPress).toHaveBeenCalledWith('\x1b');

    manager.handleKeyPress.mockClear();
    manager.handleData('\x1b[');
    expect(manager.handleKeyPress).not.toHaveBeenCalled();
    expect(manager.buffer).toBe('\x1b[');

    manager.handleData('A');
    expect(manager.handleKeyPress).toHaveBeenCalledWith('\x1b[A');
    expect(manager.buffer).toBe('');
  });

  test('handleKeyPress handles global ctrl+c and alt+m shortcuts', () => {
    const onExit = mock(() => {});
    const toggleMouseTracking = mock(() => {});
    const manager = new InputManager({ onExit });
    manager.setVuettyInstance({ toggleMouseTracking });

    manager.handleKeyPress('\x03');
    manager.handleKeyPress('\x1bm');

    expect(onExit).toHaveBeenCalledTimes(1);
    expect(toggleMouseTracking).toHaveBeenCalledTimes(1);
  });

  test('handleKeyPress handles mouse sequences before key parsing', () => {
    const manager = new InputManager();
    manager.handleMouseEvent = mock(() => {});

    manager.handleKeyPress('\x1b[<0;4;3M');

    expect(manager.handleMouseEvent).toHaveBeenCalledWith('\x1b[<0;4;3M');
  });

  test('handleKeyPress captures debug key events and supports tab navigation', () => {
    const captureEvent = mock(() => {});
    const focusNext = mock(() => true);
    const manager = new InputManager();
    manager.setVuettyInstance({
      debugServer: { captureEvent }
    });
    manager.focusNext = focusNext;

    manager.handleKeyPress('\t');

    expect(focusNext).toHaveBeenCalledTimes(1);
    expect(captureEvent).toHaveBeenCalledTimes(1);
    expect(captureEvent.mock.calls[0][0]).toBe('input.key');
  });

  test('handleKeyPress gives priority to viewport handler when consumed', () => {
    const componentHandler = mock(() => true);
    const viewportHandler = mock(() => true);
    const onInputChange = mock(() => {});
    const manager = new InputManager({ onInputChange });

    manager.registerComponent('comp', componentHandler);
    manager.setViewportHandler(viewportHandler);
    onInputChange.mockClear();
    manager.handleKeyPress('k');

    expect(viewportHandler).toHaveBeenCalledTimes(1);
    expect(componentHandler).not.toHaveBeenCalled();
    expect(onInputChange).not.toHaveBeenCalled();
  });

  test('handleKeyPress dispatches to focused component then non-focusable shortcuts', () => {
    const focusedHandler = mock(() => false);
    const globalShortcutHandler = mock(() => true);
    const onInputChange = mock(() => {});
    const manager = new InputManager({ onInputChange });

    manager.registerComponent('focused', focusedHandler);
    manager.registerComponent('global', globalShortcutHandler, {
      focusable: false
    });
    manager.focus('focused');

    manager.handleKeyPress('a');

    expect(focusedHandler).toHaveBeenCalledTimes(1);
    expect(globalShortcutHandler).toHaveBeenCalledTimes(1);
    expect(onInputChange).toHaveBeenCalled();
  });

  test('focusPrevious clears focus when only disabled or non-focusable components remain', () => {
    const manager = new InputManager();
    manager.registerComponent('a', () => {});
    manager.registerComponent('b', () => {}, { disabled: true });
    manager.registerComponent('c', () => {}, { focusable: false });

    manager.focus('a');
    manager.setComponentDisabled('a', true);
    const result = manager.focusPrevious();

    expect(result).toBe(false);
    expect(manager.focusedId.value).toBe(null);
  });

  test('handleMouseEvent captures debug payload and forwards to viewport handler', () => {
    const captureEvent = mock(() => {});
    const viewportHandler = mock(() => true);
    const manager = new InputManager();
    manager.setVuettyInstance({
      debugServer: { captureEvent }
    });
    manager.setViewportHandler(viewportHandler);

    manager.handleMouseEvent('\x1b[<0;7;9M');

    expect(captureEvent).toHaveBeenCalledTimes(1);
    expect(captureEvent.mock.calls[0][0]).toBe('input.mouse');
    expect(viewportHandler).toHaveBeenCalledTimes(1);
    expect(viewportHandler.mock.calls[0][0]).toMatchObject({
      type: 'mouse',
      action: 'left_click',
      x: 7,
      y: 9
    });
  });

  test('handleMouseEvent ignores invalid sequences', () => {
    const viewportHandler = mock(() => true);
    const manager = new InputManager();
    manager.setViewportHandler(viewportHandler);

    manager.handleMouseEvent('not-a-mouse-seq');

    expect(viewportHandler).not.toHaveBeenCalled();
  });
});
