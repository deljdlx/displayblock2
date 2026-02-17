/**
 * TargetingSystem.js — selection des cibles ennemies.
 */

export class TargetingSystem {
    /**
     * @type {Array<import('../shapes/Cube.js').Cube>}
     */
    _enemies;

    /**
     * @param {Array<import('../shapes/Cube.js').Cube>} enemies
     */
    constructor(enemies) {
        this._enemies = enemies;
    }

    /**
     * @returns {import('../shapes/Cube.js').Cube|null}
     */
    pickRandomEnemy() {
        if (this._enemies.length === 0) {
            return null;
        }
        const index = Math.floor(Math.random() * this._enemies.length);
        return this._enemies[index];
    }
}
