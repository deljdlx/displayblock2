/**
 * GridCellManager.js — Gère l'état et le contenu de chaque cellule de la grille.
 * Chaque cellule (col, row) peut contenir 0 ou plusieurs cubes cibles.
 * Permet le suivi des cubes empilés et facilite la gestion de l'empilement.
 */

export class GridCellManager {
    /**
     * @type {Map<string, Array<Object>>}
     * Clé: "col,row" | Valeur: tableau de {cube: Cube, type: string}
     */
    _cells;

    /**
     * @type {number}
     */
    _columns;

    /**
     * @type {number}
     */
    _rows;

    /**
     * @param {number} columns - Nombre de colonnes de la grille
     * @param {number} rows - Nombre de lignes de la grille
     */
    constructor(columns, rows) {
        this._columns = columns;
        this._rows = rows;
        this._cells = new Map();
        this._initializeCells();
    }

    /**
     * Initialise toutes les cellules comme vides.
     * @returns {void}
     * @private
     */
    _initializeCells() {
        for (let col = 0; col < this._columns; col += 1) {
            for (let row = 0; row < this._rows; row += 1) {
                const key = this._getCellKey(col, row);
                this._cells.set(key, []);
            }
        }
    }

    /**
     * Génère une clé unique pour une cellule.
     * @param {number} col - Colonne
     * @param {number} row - Ligne
     * @returns {string} Clé au format "col,row"
     * @private
     */
    _getCellKey(col, row) {
        return `${col},${row}`;
    }

    /**
     * Ajoute un cube cible à une cellule.
     * @param {number} col - Colonne
     * @param {number} row - Ligne
     * @param {Object} cube - Le cube 3D à ajouter
     * @param {string} type - Le type du cube (ex: 'type-0', 'type-1', etc)
     * @returns {number} L'indice du cube dans la pile (0 = bottom, 1 = second, etc)
     */
    addCubeToCell(col, row, cube, type) {
        if (col < 0 || col >= this._columns || row < 0 || row >= this._rows) {
            console.warn(`Cellule invalide: (${col}, ${row})`);
            return -1;
        }

        const key = this._getCellKey(col, row);
        const content = this._cells.get(key);
        content.push({ cube, type });

        return content.length - 1;
    }

    /**
     * Retourne le contenu d'une cellule.
     * @param {number} col - Colonne
     * @param {number} row - Ligne
     * @returns {Array<Object>} Tableau de {cube: Cube, type: string}
     */
    getCellContent(col, row) {
        const key = this._getCellKey(col, row);
        return this._cells.get(key) || [];
    }

    /**
     * Récupère le nombre de cubes dans une cellule.
     * @param {number} col - Colonne
     * @param {number} row - Ligne
     * @returns {number} Nombre de cubes dans la cellule
     */
    getCellStackHeight(col, row) {
        return this.getCellContent(col, row).length;
    }

    /**
     * Supprime tous les cubes d'une cellule.
     * @param {number} col - Colonne
     * @param {number} row - Ligne
     * @returns {Array<Object>} Les cubes supprimés
     */
    clearCell(col, row) {
        const key = this._getCellKey(col, row);
        const content = this._cells.get(key);
        this._cells.set(key, []);
        return content;
    }

    /**
     * Réinitialise la grille complète (vide toutes les cellules).
     * @returns {void}
     */
    reset() {
        this._cells.clear();
        this._initializeCells();
    }

    /**
     * Récupère le nombre total de cubes empilés.
     * @returns {number}
     */
    getTotalCubeCount() {
        let total = 0;
        for (const content of this._cells.values()) {
            total += content.length;
        }
        return total;
    }
}
