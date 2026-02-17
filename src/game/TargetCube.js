/**
 * TargetCube.js — Cube cible invisible utilisé pour diriger les projectiles.
 * Devient visible après impact pour montrer les trajectoires du feu d'artifice.
 */

import { Cube } from '../shapes/Cube.js';
import { SIZE_FACTORS, GRID_CONFIG } from './config/Constants.js';

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
     * Crée un cubé cible invisible.
     * @param {import('../engine/Grid.js').Grid} grid - Grille pour convertir grid → world coords
     */
    constructor(grid) {
        this._grid = grid;
        const size = GRID_CONFIG.cellSize * SIZE_FACTORS.targetCube;
        this._cube = new Cube(size);
        this._cube.setColor('rgba(0, 0, 0, 0)');
        this._cube.el.style.pointerEvents = 'none';
        this._cube.el.style.opacity = '0';
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
     * Retourne le cube interne pour intégration avec le moteur.
     * @returns {Cube}
     */
    getCube() {
        return this._cube;
    }
}
