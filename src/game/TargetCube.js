/**
 * TargetCube.js — Cube cible invisible utilisé pour diriger les projectiles.
 * Devient visible après impact pour montrer les trajectoires du feu d'artifice.
 * Peut avoir un type spécifique qui détermine son style visuel.
 */

import { Cube } from '../shapes/Cube.js';
import { SIZE_FACTORS, GRID_CONFIG, TARGET_CUBE_TYPES } from './config/Constants.js';

export class TargetCube {
    /**
     * @type {Cube}
     */
    _cube;

    /**
     * @type {import('../engine/Grid.js').Grid}
     */
    _grid;

    /**
     * @type {string}
     */
    _type;

    /**
     * Crée un cube cible invisible avec un type optionnel.
     * @param {import('../engine/Grid.js').Grid} grid - Grille pour convertir grid → world coords
     * @param {string|null} type - Type de cible (ex: 'type-0'), aléatoire si null
     */
    constructor(grid, type = null) {
        this._grid = grid;
        this._type = type || this._selectRandomType();
        
        const size = GRID_CONFIG.cellSize * SIZE_FACTORS.targetCube;
        this._cube = new Cube(size);
        
        const typeConfig = TARGET_CUBE_TYPES[this._type];
        this._cube.setColor(typeConfig.color);
        this._cube.el.style.pointerEvents = 'none';
        this._cube.el.style.opacity = '0';
    }

    /**
     * Sélectionne un type aléatoire parmi les types disponibles.
     * @returns {string}
     */
    _selectRandomType() {
        const types = Object.keys(TARGET_CUBE_TYPES);
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Positionne le cube cible à une cellule aléatoire de la grille.
     * Utilise la position world pour être indépendant du viewport.
     * @returns {void}
     */
    positionRandomly() {
        const randomCol = Math.floor(Math.random() * GRID_CONFIG.columns);
        const randomRow = Math.floor(Math.random() * GRID_CONFIG.rows);
        const worldPos = this._grid.cellToWorld(randomCol, randomRow);

        this._cube.setPosition(worldPos.x, worldPos.y, worldPos.z);
    }

    /**
     * Rend le cube visible (après impact du projectile).
     * @returns {void}
     */
    revealOnImpact() {
        this._cube.el.style.opacity = '1';
    }

    /**
     * Retourne le type de ce cube cible.
     * @returns {string}
     */
    getType() {
        return this._type;
    }

    /**
     * Retourne le cube interne pour intégration avec le moteur.
     * @returns {Cube}
     */
    getCube() {
        return this._cube;
    }
}
