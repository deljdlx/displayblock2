/**
 * TargetCubeCounter.js — Gestionnaire qui suit les cubes cibles et compte par type.
 * Fournit les statistiques en temps réel et notifie les observateurs.
 */

import { TARGET_CUBE_TYPES } from './config/TargetCubeColors.js';

export class TargetCubeCounter {
    /**
     * @type {Map<string, number>}
     * Compte des cubes par type: 'type-0' → 5, etc.
     */
    _counts;

    /**
     * @type {Set<Function>}
     * Callbacks notifiées quand les comptes changent
     */
    _observers;

    constructor() {
        this._counts = new Map();
        this._observers = new Set();

        // Initialise les comptes à 0 pour tous les types
        for (const typeKey of Object.keys(TARGET_CUBE_TYPES)) {
            this._counts.set(typeKey, 0);
        }
    }

    /**
     * Enregistre un observateur qui sera notifié quand les comptes changent.
     * @param {(stats: Map<string, number>) => void} callback
     * @returns {void}
     */
    subscribe(callback) {
        this._observers.add(callback);
    }

    /**
     * Désenregistre un observateur.
     * @param {(stats: Map<string, number>) => void} callback
     * @returns {void}
     */
    unsubscribe(callback) {
        this._observers.delete(callback);
    }

    /**
     * Incrémente le compte pour un type de cube cible.
     * Notifie tous les observateurs.
     * @param {string} type - Type de cube (ex: 'type-0')
     * @returns {void}
     */
    increment(type) {
        if (!this._counts.has(type)) {
            this._counts.set(type, 0);
        }
        this._counts.set(type, this._counts.get(type) + 1);
        this._notifyObservers();
    }

    /**
     * Décrémente le compte pour un type de cube cible.
     * Notifie tous les observateurs.
     * @param {string} type - Type de cube (ex: 'type-0')
     * @returns {void}
     */
    decrement(type) {
        if (this._counts.has(type)) {
            const current = this._counts.get(type);
            this._counts.set(type, Math.max(0, current - 1));
            this._notifyObservers();
        }
    }

    /**
     * Obtient le compte pour un type spécifique.
     * @param {string} type - Type de cube
     * @returns {number}
     */
    getCount(type) {
        return this._counts.get(type) ?? 0;
    }

    /**
     * Obtient tous les comptes actuels.
     * @returns {Map<string, number>}
     */
    getCounts() {
        return new Map(this._counts);
    }

    /**
     * Réinitialise tous les comptes à 0.
     * Notifie les observateurs.
     * @returns {void}
     */
    reset() {
        for (const typeKey of this._counts.keys()) {
            this._counts.set(typeKey, 0);
        }
        this._notifyObservers();
    }

    /**
     * Notifie tous les observateurs des changements.
     * @returns {void}
     */
    _notifyObservers() {
        const counts = this.getCounts();
        for (const observer of this._observers) {
            observer(counts);
        }
    }
}
