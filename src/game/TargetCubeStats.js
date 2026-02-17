/**
 * TargetCubeStats.js — Panel UI affichant le comptage des cubes cibles par type.
 * Se met à jour en temps réel quand de nouveaux cubes apparaissent.
 */

import { TARGET_CUBE_TYPES } from './config/TargetCubeColors.js';

export class TargetCubeStats {
    /**
     * @type {HTMLElement}
     */
    _container;

    /**
     * @type {Map<string, HTMLElement>}
     * Références aux éléments de comptage par type
     */
    _countElements;

    /**
     * @type {TargetCubeCounter}
     */
    _counter;

    /**
     * Crée et initialise le panel de statistiques.
     * @param {TargetCubeCounter} counter - Gestionnaire des comptages
     * @param {HTMLElement} parentElement - Élément parent où ajouter le panel
     */
    constructor(counter, parentElement) {
        this._counter = counter;
        this._countElements = new Map();
        this._container = this._createPanel();
        parentElement.appendChild(this._container);

        // S'abonne aux changements de comptage
        this._counter.subscribe((counts) => this._updateDisplay(counts));

        // Affichage initial
        this._updateDisplay(this._counter.getCounts());
    }

    /**
     * Crée le panel HTML avec les compteurs pour chaque type.
     * @returns {HTMLElement}
     */
    _createPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 12px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
            min-width: 140px;
            border: 1px solid #444;
        `;
        panel.className = 'target-cube-stats';

        // Titre
        const title = document.createElement('div');
        title.style.cssText = `
            margin-bottom: 8px;
            font-weight: bold;
            border-bottom: 1px solid #666;
            padding-bottom: 4px;
        `;
        title.textContent = 'Types de cubes';
        panel.appendChild(title);

        // Compteur pour chaque type
        for (const [typeKey, typeConfig] of Object.entries(TARGET_CUBE_TYPES)) {
            const row = document.createElement('div');
            row.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;
                gap: 8px;
            `;

            const label = document.createElement('span');
            label.textContent = typeKey;
            label.style.cssText = `
                color: ${typeConfig.color};
                font-weight: bold;
                min-width: 50px;
            `;

            const countElement = document.createElement('span');
            countElement.textContent = '0';
            countElement.style.cssText = `
                text-align: right;
                min-width: 20px;
            `;

            row.appendChild(label);
            row.appendChild(countElement);
            panel.appendChild(row);

            this._countElements.set(typeKey, countElement);
        }

        return panel;
    }

    /**
     * Met à jour l'affichage avec les nouveaux comptes.
     * @param {Map<string, number>} counts - Comptes par type
     * @returns {void}
     */
    _updateDisplay(counts) {
        for (const [typeKey, count] of counts) {
            const element = this._countElements.get(typeKey);
            if (element) {
                element.textContent = String(count);
            }
        }
    }

    /**
     * Détache le panel de l'interface.
     * @returns {void}
     */
    destroy() {
        if (this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
    }
}
