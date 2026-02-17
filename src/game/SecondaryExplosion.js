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
     * Génère des positions aléatoires dans un rayon donné autour d'une cellule centrale.
     * Les positions sont clampées aux limites de la grille.
     *
     * @param {number} centerCol - Colonne de la cellule centrale
     * @param {number} centerRow - Ligne de la cellule centrale
     * @param {number} radius - Rayon en nombre de cellules
     * @param {number} cols - Nombre de colonnes de la grille
     * @param {number} rows - Nombre de lignes de la grille
     * @param {number} count - Nombre de positions à générer
     * @returns {Array<{col: number, row: number}>}
     */
    static generateRandomPositions(centerCol, centerRow, radius, cols, rows, count) {
        const positions = [];
        for (let i = 0; i < count; i++) {
            const offsetCol = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
            const offsetRow = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
            positions.push({
                col: Math.max(0, Math.min(cols - 1, centerCol + offsetCol)),
                row: Math.max(0, Math.min(rows - 1, centerRow + offsetRow)),
            });
        }
        return positions;
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
