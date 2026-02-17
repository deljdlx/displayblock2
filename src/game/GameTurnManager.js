/**
 * GameTurnManager.js — Gère l'état des tours de jeu.
 * Permet de naviguer entre les tours et notifie les observateurs des changements.
 * Utilise le pattern Observer pour les mises à jour en temps réel.
 */

export class GameTurnManager {
    /**
     * @type {number}
     */
    _currentTurn;

    /**
     * @type {Set<Function>}
     */
    _turnStartedSubscribers;

    constructor() {
        this._currentTurn = 1;
        this._turnStartedSubscribers = new Set();
    }

    /**
     * Récupère le numéro du tour courant.
     * @returns {number} Le numéro du tour (à partir de 1)
     */
    getCurrentTurn() {
        return this._currentTurn;
    }

    /**
     * Passe au tour suivant et notifie tous les observateurs.
     * @returns {number} Le nouveau numéro de tour
     */
    nextTurn() {
        this._currentTurn += 1;
        this._notifyTurnStarted();
        return this._currentTurn;
    }

    /**
     * S'abonne aux événements de début de tour.
     * @param {Function} callback - Fonction appelée au début de chaque tour avec le numéro du tour
     * @returns {void}
     */
    subscribeTurnStarted(callback) {
        this._turnStartedSubscribers.add(callback);
    }

    /**
     * Se désabonne des événements de début de tour.
     * @param {Function} callback - Fonction à désabonner
     * @returns {void}
     */
    unsubscribeTurnStarted(callback) {
        this._turnStartedSubscribers.delete(callback);
    }

    /**
     * Notifie tous les observateurs qu'un nouveau tour a commencé.
     * @returns {void}
     * @private
     */
    _notifyTurnStarted() {
        for (const callback of this._turnStartedSubscribers) {
            callback(this._currentTurn);
        }
    }
}
