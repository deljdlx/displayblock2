/**
 * AnimationClock.js — boucle requestAnimationFrame partagee pour synchroniser les animations.
 * Centralise la gestion du RAF (requestAnimationFrame) pour éviter les fuites mémoire
 * et assurer que tous les systèmes d'animation utilisent le même horloge (60fps).
 * Se démarre automatiquement à la première écoute et s'arrête quand il n'y a plus d'écouteurs.
 */

export class AnimationClock {
    /**
     * @type {number|null}
     */
    _rafId;

    /**
     * @type {Set<Function>}
     */
    _listeners;

    constructor() {
        this._rafId = null;
        this._listeners = new Set();
    }

    /**
     * @param {(timeMs: number) => void} listener
     * @returns {void}
     */
    add(listener) {
        this._listeners.add(listener);
        this._ensureRunning();
    }

    /**
     * @param {(timeMs: number) => void} listener
     * @returns {void}
     */
    remove(listener) {
        this._listeners.delete(listener);
        if (this._listeners.size === 0) {
            this._stop();
        }
    }

    /**
     * @returns {void}
     */
    _ensureRunning() {
        if (this._rafId !== null) {
            return;
        }
        const tick = (timeMs) => {
            for (const listener of this._listeners) {
                listener(timeMs);
            }
            if (this._listeners.size > 0) {
                this._rafId = window.requestAnimationFrame(tick);
            } else {
                this._rafId = null;
            }
        };
        this._rafId = window.requestAnimationFrame(tick);
    }

    /**
     * @returns {void}
     */
    _stop() {
        if (this._rafId !== null) {
            window.cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }
}
