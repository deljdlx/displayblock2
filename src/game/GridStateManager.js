/**
 * GridStateManager.js — Gestionnaire pour basculer entre différents layouts de grille.
 * Permet de charger différentes configurations de grille prédéfinies.
 */

import { GRID_LAYOUT_FULL, GRID_LAYOUT_MINIMAL } from './config/GridLayouts.js';

export class GridStateManager {
    /**
     * @type {Object}
     * Layout actuel utilisé
     */
    _currentLayout;

    /**
     * @type {Map<string, Object>}
     * Layouts disponibles par clé
     */
    _layouts;

    constructor() {
        this._layouts = new Map();
        this._layouts.set('full', GRID_LAYOUT_FULL);
        this._layouts.set('minimal', GRID_LAYOUT_MINIMAL);
        this._currentLayout = GRID_LAYOUT_FULL;
    }

    /**
     * Charge un layout par sa clé.
     * @param {string} layoutKey - Clé du layout ('full', 'minimal', etc)
     * @returns {Object} Le layout chargé
     */
    loadLayout(layoutKey) {
        if (this._layouts.has(layoutKey)) {
            this._currentLayout = this._layouts.get(layoutKey);
            console.warn(`Layout "${layoutKey}" chargé`);
            return this._currentLayout;
        }
        console.warn(`Layout "${layoutKey}" non trouvé`);
        return this._currentLayout;
    }

    /**
     * Obtient le layout actuel.
     * @returns {Object}
     */
    getCurrentLayout() {
        return this._currentLayout;
    }

    /**
     * Ajoute un nouveau layout personnalisé.
     * @param {string} key - Clé unique du layout
     * @param {Object} layout - Descripteur du layout
     * @returns {void}
     */
    registerLayout(key, layout) {
        this._layouts.set(key, layout);
        console.warn(`Layout "${key}" enregistré`);
    }

    /**
     * Obtient la liste de tous les layouts disponibles.
     * @returns {Array<string>}
     */
    getAvailableLayouts() {
        return Array.from(this._layouts.keys());
    }
}
