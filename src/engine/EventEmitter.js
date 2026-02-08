/**
 * EventEmitter — lightweight pub/sub mixin for the 3D engine.
 *
 * Provides per-instance event registration (on/off/once) and emission.
 * Every method returns `this` for fluent chaining.
 */
export class EventEmitter {
  constructor() {
    /** @type {Object<string, Array<{fn: Function, once: boolean}>>} */
    this._listeners = {};
  }

  /**
   * Register a listener for an event.
   *
   * @param {string} event
   * @param {Function} fn
   * @returns {this}
   */
  on(event, fn) {
    (this._listeners[event] ??= []).push({ fn, once: false });
    return this;
  }

  /**
   * Register a one-shot listener (auto-removed after first call).
   *
   * @param {string} event
   * @param {Function} fn
   * @returns {this}
   */
  once(event, fn) {
    (this._listeners[event] ??= []).push({ fn, once: true });
    return this;
  }

  /**
   * Remove a previously registered listener.
   *
   * @param {string} event
   * @param {Function} fn
   * @returns {this}
   */
  off(event, fn) {
    const list = this._listeners[event];
    if (!list) {
      return this;
    }
    const idx = list.findIndex((entry) => entry.fn === fn);
    if (idx !== -1) {
      list.splice(idx, 1);
    }
    return this;
  }

  /**
   * Emit an event, calling every registered listener with `data`.
   * Iterates over a shallow copy so that `once` and `off` during
   * iteration are safe.
   *
   * @param {string} event
   * @param {*} [data]
   * @returns {this}
   */
  emit(event, data) {
    const list = this._listeners[event];
    if (!list) {
      return this;
    }
    // Shallow copy — safe if a listener calls off() or triggers once removal
    for (const entry of [...list]) {
      if (entry.once) {
        this.off(event, entry.fn);
      }
      entry.fn(data);
    }
    return this;
  }
}
