/**
 * SecondaryExplosion.js — Crée la cascade de cubes suite à un impact de missile joueur.
 * Les 10 cubes se placent dans une grille 2x2 avec modulo 4 pour les positions.
 */

// Nombre de positions par étage dans la grille (configurable)
export const POSITIONS_PER_LEVEL = 4;

export class SecondaryExplosion {
    /**
     * Convertit une position world (x, z) en coordonnées de cellule grille.
     * 
     * @param {number} worldX - Position X dans le monde 3D
     * @param {number} worldZ - Position Z dans le monde 3D
     * @param {number} cols - Nombre de colonnes de la grille
     * @param {number} rows - Nombre de lignes de la grille
     * @param {number} cellSize - Taille d'une cellule
     * @returns {{col: number, row: number}}
     */
    static worldToCell(worldX, worldZ, cols, rows, cellSize) {
        const totalW = cols * cellSize;
        const totalH = rows * cellSize;

        // Inverse les formules de cellToWorld
        const col = Math.round((worldX + totalW / 2) / cellSize - 0.5);
        const row = Math.round((worldZ + totalH / 2) / cellSize - 0.5);

        return {
            col: Math.max(0, Math.min(cols - 1, col)),
            row: Math.max(0, Math.min(rows - 1, row)),
        };
    }

    /**
     * Retourne la position locale (0-3) dans la grille 2x2 basée sur l'index du cube.
     * 0 = haut-gauche, 1 = haut-droite, 2 = bas-gauche, 3 = bas-droite
     * 
     * @param {number} cubeIndex - Index du cube (0-9)
     * @returns {{subCol: number, subRow: number}}
     */
    static getSubPosition(cubeIndex) {
        const pos = cubeIndex % POSITIONS_PER_LEVEL;
        return {
            subCol: pos % 2,
            subRow: Math.floor(pos / 2),
        };
    }
}
