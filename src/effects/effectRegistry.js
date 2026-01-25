// src/effects/effectRegistry.js

/**
 * Effect function signature:
 * @callback EffectFunction
 * @param {string} text - Plain text (ANSI stripped by caller)
 * @param {Object} effectProps - Effect-specific properties
 * @param {number} frame - Animation frame (0 for static effects)
 * @returns {string} - Styled text with ANSI codes
 */

/**
 * Registry for text effects
 * Follows the same pattern as renderHandlerRegistry
 */
class EffectRegistry {
  constructor() {
    this.effects = new Map();
  }

  /**
   * Register an effect
   * @param {string} name - Effect name (e.g., 'gradient', 'rainbow')
   * @param {EffectFunction} effectFn - Effect function
   * @param {Object} options - Effect metadata
   * @param {boolean} [options.animated=false] - Whether effect supports animation
   * @param {number} [options.defaultInterval=100] - Default animation interval (ms)
   */
  register(name, effectFn, options = {}) {
    this.effects.set(name, {
      fn: effectFn,
      animated: options.animated || false,
      defaultInterval: options.defaultInterval || 100
    });
  }

  /**
   * Get an effect by name
   * @param {string} name - Effect name
   * @returns {{ fn: EffectFunction, animated: boolean, defaultInterval: number } | null}
   */
  get(name) {
    return this.effects.get(name) || null;
  }

  /**
   * Check if an effect exists
   * @param {string} name - Effect name
   * @returns {boolean}
   */
  has(name) {
    return this.effects.has(name);
  }

  /**
   * Unregister an effect
   * @param {string} name - Effect name
   */
  unregister(name) {
    this.effects.delete(name);
  }

  /**
   * Get all registered effect names
   * @returns {string[]}
   */
  getAll() {
    return Array.from(this.effects.keys());
  }
}

export const effectRegistry = new EffectRegistry();
