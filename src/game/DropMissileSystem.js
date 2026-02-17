/**
 * DropMissileSystem.js — Gère les missiles qui tombent verticalement.
 * Lorsqu'un missile touche la grille (Y = 0), il explose avec un feu d'artifice.
 */

import { Cube } from '../shapes/Cube.js';
import { SIZE_FACTORS, MISSILE_CONFIGS, DROP_MISSILE_CONFIG } from './config/Constants.js';

export class DropMissileSystem {
    /**
     * @type {import('../engine/Scene.js').Scene}
     */
    _scene;

    /**
     * @type {AnimationClock}
     */
    _clock;

    /**
     * @type {import('./ExplosionSystem.js').ExplosionSystem}
     */
    _explosionSystem;

    /**
     * @type {import('./ImpactShakeSystem.js').ImpactShakeSystem}
     */
    _impactSystem;

    /**
     * @type {number}
     */
    _cellSize;

    /**
     * @type {number}
     */
    _groundY;

    /**
     * @type {Array<Object>}
     * Tableau de missiles en vol: {cube: Cube, x: number, z: number, y: number, velocity: number}
     */
    _activeMissiles;

    /**
     * @type {Function}
     * Callback appelé quand un missile explose (col, row, missileX, missileY, missileZ)
     */
    _onMissileHit;

    /**
     * @param {import('../engine/Scene.js').Scene} scene - Scene 3D
     * @param {AnimationClock} clock - Horloge d'animation
     * @param {import('./ExplosionSystem.js').ExplosionSystem} explosionSystem - Système d'explosions
     * @param {import('./ImpactShakeSystem.js').ImpactShakeSystem} impactSystem - Système de secousses
     * @param {number} cellSize - Taille d'une cellule
     * @param {number} groundY - Position Y du sol
     */
    constructor(scene, clock, explosionSystem, impactSystem, cellSize, groundY) {
        this._scene = scene;
        this._clock = clock;
        this._explosionSystem = explosionSystem;
        this._impactSystem = impactSystem;
        this._cellSize = cellSize;
        this._groundY = groundY;
        this._activeMissiles = [];
        this._onMissileHit = null;

        // Met à jour les missiles chaque frame
        this._clock.add(() => {
            this._updateMissiles();
        });
    }

    /**
     * Définit le callback appelé quand un missile explose.
     * @param {Function} callback - (col, row, x, y, z) => void
     * @returns {void}
     */
    setOnMissileHit(callback) {
        this._onMissileHit = callback;
    }

    /**
     * Lance un missile qui tombe verticalement à partir de (worldX, worldZ).
     * @param {number} worldX - Position X dans le monde 3D
     * @param {number} worldZ - Position Z dans le monde 3D
     * @returns {void}
     */
    dropMissile(worldX, worldZ) {
        const defaults = MISSILE_CONFIGS.default;
        const missileSize = Math.max(SIZE_FACTORS.projectileMinPx, Math.round(this._cellSize * SIZE_FACTORS.projectile));
        const missile = new Cube(missileSize);
        missile.setColor(defaults.color);

        // Position initiale: très haut (Y très négatif)
        const startY = -(this._cellSize * DROP_MISSILE_CONFIG.startHeightMultiplier);
        missile.setPosition(worldX, startY, worldZ);
        this._scene.add(missile);

        this._activeMissiles.push({
            cube: missile,
            x: worldX,
            z: worldZ,
            y: startY,
            velocity: 0,
            gravity: DROP_MISSILE_CONFIG.gravity,
        });
    }

    /**
     * Met à jour tous les missiles en vol.
     * Détecte les collisions avec le sol et déclenche les explosions.
     * @returns {void}
     * @private
     */
    _updateMissiles() {
        const toRemove = [];

        for (let i = 0; i < this._activeMissiles.length; i += 1) {
            const missile = this._activeMissiles[i];
            const deltaTime = DROP_MISSILE_CONFIG.fixedDeltaTime;

            // Applique la gravité (positive pour descendre vers Y+ = bas)
            missile.velocity += missile.gravity * deltaTime;
            missile.y += missile.velocity * deltaTime;

            missile.cube.setPosition(missile.x, missile.y, missile.z);

            // Détecte la collision avec le sol (Y = 0)
            if (missile.y >= 0) {
                toRemove.push(i);

                // Déclenche l'explosion visuelle
                const defaults = MISSILE_CONFIGS.default;
                this._explosionSystem.spawnExplosion(
                    { x: missile.x, y: 0, z: missile.z },
                    {
                        particleCount: defaults.particleCount,
                        particleColors: defaults.particleColors,
                    },
                );

                // Lance le callback d'impact si défini
                if (this._onMissileHit) {
                    this._onMissileHit(missile.x, missile.z);
                }

                // Retire le missile de la scène
                this._scene.remove(missile.cube);
            }
        }

        // Retire les missiles explosés (en ordre inverse pour éviter les problèmes d'index)
        for (let i = toRemove.length - 1; i >= 0; i -= 1) {
            this._activeMissiles.splice(toRemove[i], 1);
        }
    }
}
