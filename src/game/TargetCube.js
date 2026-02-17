/**
 * TargetCube.js — Cube cible qui représente un élément de grille.
 * Chaque cube cible appartient à une cellule (col, row) et a un type spécifique.
 * Le positionnement physique en 3D est géré par le système de rendu, pas par cette classe.
 */

import { Cube } from '../shapes/Cube.js';
import { SIZE_FACTORS, GRID_CONFIG, TARGET_CUBE_TYPES } from './config/Constants.js';

export class TargetCube {
    /**
     * @type {Cube}
     */
    _cube;

    /**
     * @type {string}
     */
    _type;

    /**
     * @type {number}
     */
    _gridColumn;

    /**
     * @type {number}
     */
    _gridRow;

    /**
     * @type {number}
     */
    _stackIndex;

    /**
     * Crée un cube cible avec un type spécifique.
     * @param {string|null} type - Type de cible (ex: 'type-0'), aléatoire si null
     */
    constructor(type = null) {
        this._type = type || this._selectRandomType();
        this._gridColumn = null;
        this._gridRow = null;
        this._stackIndex = 0;
        
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
     * @private
     */
    _selectRandomType() {
        const types = Object.keys(TARGET_CUBE_TYPES);
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Associe ce cube à une cellule de la grille.
     * @param {number} col - Colonne de la cellule
     * @param {number} row - Ligne de la cellule
     * @param {number} stackIndex - Indice dans la pile (0 = bottom)
     * @returns {void}
     */
    placeInCell(col, row, stackIndex = 0) {
        this._gridColumn = col;
        this._gridRow = row;
        this._stackIndex = stackIndex;
    }

    /**
     * Récupère la colonne de la cellule contenant ce cube.
     * @returns {number|null}
     */
    getGridColumn() {
        return this._gridColumn;
    }

    /**
     * Récupère la ligne de la cellule contenant ce cube.
     * @returns {number|null}
     */
    getGridRow() {
        return this._gridRow;
    }

    /**
     * Récupère l'indice dans la pile (0 = au sol).
     * @returns {number}
     */
    getStackIndex() {
        return this._stackIndex;
    }

    /**
     * Récupère le type de ce cube cible.
     * @returns {string}
     */
    getType() {
        return this._type;
    }

    /**
     * Récupère le cube 3D pour le rendu.
     * @returns {Cube}
     */
    getCube() {
        return this._cube;
    }

}
