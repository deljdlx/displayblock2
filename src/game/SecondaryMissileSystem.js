/**
 * SecondaryMissileSystem.js — Génère des petits missiles qui se déplacent horizontalement
 * du point d'impact vers des positions cibles, puis crée des TargetCube à l'arrivée.
 */

import { Cube } from '../shapes/Cube.js';

export class SecondaryMissileSystem {
    /**
     * @type {import('../engine/Scene.js').Scene}
     */
    _scene;

    /**
     * @type {AnimationClock}
     */
    _clock;

    /**
     * @type {number}
     */
    _cellSize;

    /**
     * @type {Array<Object>}
     * Missiles en vol: {cube: Cube, x: number, z: number, targetX: number, targetZ: number, progress: number, duration: number}
     */
    _activeMissiles;

    /**
     * @type {Function}
     * Callback appelé quand un missile arrive à destination
     */
    _onMissileArrival;

    /**
     * @param {import('../engine/Scene.js').Scene} scene - Scene 3D
     * @param {AnimationClock} clock - Horloge d'animation
     * @param {number} cellSize - Taille d'une cellule
     */
    constructor(scene, clock, cellSize) {
        this._scene = scene;
        this._clock = clock;
        this._cellSize = cellSize;
        this._activeMissiles = [];
        this._onMissileArrival = null;

        this._clock.add(() => {
            this._updateMissiles();
        });
    }

    /**
     * Définit le callback appelé quand un missile arrive à destination.
     *
     * @param {Function} callback - (targetX, targetZ) => void
     * @returns {void}
     */
    setOnMissileArrival(callback) {
        this._onMissileArrival = callback;
    }

    /**
     * Lance un petit missile qui se déplace horizontalement vers une cible.
     *
     * @param {number} startX - Position X de départ (point d'impact)
     * @param {number} startZ - Position Z de départ (point d'impact)
     * @param {number} targetX - Position X cible (world)
     * @param {number} targetZ - Position Z cible (world)
     * @param {number} duration - Durée du trajet en secondes (défaut: 0.5)
     * @returns {void}
     */
    launchMissile(startX, startZ, targetX, targetZ, duration = 0.5) {
        const missileSize = Math.max(8, Math.round(this._cellSize * 0.15));
        const missile = new Cube(missileSize);
        missile.setColor('#ff6b6b');

        missile.setPosition(startX, 0, startZ);
        this._scene.add(missile);

        this._activeMissiles.push({
            cube: missile,
            startX,
            startZ,
            targetX,
            targetZ,
            progress: 0,
            duration,
        });
    }

    /**
     * Met à jour tous les missiles en vol.
     * Détecte l'arrivée et appelle le callback.
     *
     * @returns {void}
     * @private
     */
    _updateMissiles() {
        const toRemove = [];
        const deltaTime = 0.016; // ~60 FPS

        for (let i = 0; i < this._activeMissiles.length; i += 1) {
            const missile = this._activeMissiles[i];

            // Avance le progrès (0 à 1)
            missile.progress += deltaTime / missile.duration;

            // Interpolation linéaire vers la cible (0 à 1)
            const t = Math.min(missile.progress, 1);
            const x = missile.startX + (missile.targetX - missile.startX) * t;
            const z = missile.startZ + (missile.targetZ - missile.startZ) * t;

            missile.cube.setPosition(x, 0, z);

            // Détecte l'arrivée
            if (missile.progress >= 1) {
                toRemove.push(i);

                // Lance le callback avec la position exacte de la cible
                if (this._onMissileArrival) {
                    this._onMissileArrival(missile.targetX, missile.targetZ);
                }

                // Retire le missile de la scène
                this._scene.remove(missile.cube);
            }
        }

        // Retire les missiles arrivés (en ordre inverse)
        for (let i = toRemove.length - 1; i >= 0; i -= 1) {
            this._activeMissiles.splice(toRemove[i], 1);
        }
    }
}
