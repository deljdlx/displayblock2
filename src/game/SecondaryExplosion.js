/**
 * SecondaryExplosion.js — Crée la cascade de missiles et cubes suite à un impact de missile joueur.
 * Génère 10 missiles et 10 TargetCube dans un rayon de 3 cellules autour du point d'impact.
 */

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
     * Génère 10 positions aléatoires dans un rayon de 3 cellules autour du point d'impact.
     * 
     * @param {number} impactCol - Colonne de l'impact
     * @param {number} impactRow - Ligne de l'impact
     * @param {number} radius - Rayon en cellules (par défaut: 3)
     * @param {number} cols - Nombre de colonnes de la grille
     * @param {number} rows - Nombre de lignes de la grille
     * @returns {Array<{col: number, row: number}>}
     */
    static generateRandomPositions(impactCol, impactRow, radius, cols, rows) {
        const positions = [];
        const count = 10;

        for (let i = 0; i < count; i++) {
            // Rayon aléatoire: entre 0 et radius cellules
            const distance = Math.random() * radius;
            // Angle aléatoire: 0 à 2π
            const angle = Math.random() * Math.PI * 2;

            // Calcule la position (col, row) basée sur distance et angle
            const deltaCol = Math.round(Math.cos(angle) * distance);
            const deltaRow = Math.round(Math.sin(angle) * distance);

            const col = Math.max(0, Math.min(cols - 1, impactCol + deltaCol));
            const row = Math.max(0, Math.min(rows - 1, impactRow + deltaRow));

            positions.push({ col, row });
        }

        return positions;
    }
}
