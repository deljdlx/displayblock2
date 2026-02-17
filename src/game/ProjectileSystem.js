/**
 * ProjectileSystem.js — gere les tirs et leurs trajectoires paraboliques.
 */

import { Cube } from '../shapes/Cube.js';

/**
 * @typedef {Object} ProjectileMotion
 * @property {Cube} cube
 * @property {{x: number, y: number, z: number}} start
 * @property {{x: number, y: number, z: number}} end
 * @property {Cube} target
 * @property {number} startTime
 * @property {number} durationMs
 * @property {number} arcHeight
 */

export class ProjectileSystem {
    /**
     * @type {import('../engine/Scene.js').Scene}
     */
    _scene;

    /**
     * @type {import('./AnimationClock.js').AnimationClock}
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
    _durationMs;

    /**
     * @type {number}
     */
    _arcHeight;

    /**
     * @type {Set<ProjectileMotion>}
     */
    _activeProjectiles;

    /**
     * @param {import('../engine/Scene.js').Scene} scene
     * @param {import('./AnimationClock.js').AnimationClock} clock
     * @param {import('./ExplosionSystem.js').ExplosionSystem} explosionSystem
     * @param {import('./ImpactShakeSystem.js').ImpactShakeSystem} impactSystem
     * @param {{cellSize: number, durationMs: number, arcHeight: number}} options
     */
    constructor(scene, clock, explosionSystem, impactSystem, options) {
        this._scene = scene;
        this._clock = clock;
        this._explosionSystem = explosionSystem;
        this._impactSystem = impactSystem;
        this._cellSize = options.cellSize;
        this._durationMs = options.durationMs;
        this._arcHeight = options.arcHeight;
        this._activeProjectiles = new Set();
        this._tick = this._tick.bind(this);
    }

    /**
     * @param {Cube} source
     * @param {Cube} target
     * @returns {void}
     */
    fire(source, target) {
        if (!source || !target) {
            return;
        }

        const projectileSize = Math.max(14, Math.round(this._cellSize * 0.35));
        const projectile = new Cube(projectileSize);
        projectile.setColor('#ffd34d');

        const start = {
            x: source.position.x,
            y: source.position.y - Math.round(this._cellSize * 0.35),
            z: source.position.z,
        };
        const end = {
            x: target.position.x,
            y: target.position.y - Math.round(this._cellSize * 0.35),
            z: target.position.z,
        };

        projectile.setPosition(start.x, start.y, start.z);
        this._scene.add(projectile);

        const motion = {
            cube: projectile,
            start,
            end,
            target,
            startTime: window.performance.now(),
            durationMs: this._durationMs,
            arcHeight: this._arcHeight,
        };

        this._activeProjectiles.add(motion);
        this._clock.add(this._tick);

        source.animateSize(this._cellSize * 1.1, this._cellSize * 1.1, this._cellSize * 1.1, 0.15);
        source.onTransitionEnd(() => {
            source.clearFaceTransition();
            source.setSize(this._cellSize, this._cellSize, this._cellSize);
        });
    }

    /**
     * @param {number} timeMs
     * @returns {void}
     */
    _tick(timeMs) {
        for (const motion of this._activeProjectiles) {
            this._updateProjectile(motion, timeMs);
        }

        if (this._activeProjectiles.size === 0) {
            this._clock.remove(this._tick);
        }
    }

    /**
     * @param {ProjectileMotion} motion
     * @param {number} timeMs
     * @returns {void}
     */
    _updateProjectile(motion, timeMs) {
        const elapsed = timeMs - motion.startTime;
        const progress = Math.min(1, Math.max(0, elapsed / motion.durationMs));
        const lift = motion.arcHeight * this._computeGravityLift(progress);

        const x = motion.start.x + (motion.end.x - motion.start.x) * progress;
        const z = motion.start.z + (motion.end.z - motion.start.z) * progress;
        const y = motion.start.y + (motion.end.y - motion.start.y) * progress - lift;

        motion.cube.setPosition(x, y, z);

        if (progress >= 1) {
            this._explosionSystem.spawnExplosion(motion.end);
            this._impactSystem.applyTo(motion.target);
            this._scene.remove(motion.cube);
            this._activeProjectiles.delete(motion);
        }
    }

    /**
     * @param {number} progress
     * @returns {number}
     */
    _computeGravityLift(progress) {
        if (progress <= 0 || progress >= 1) {
            return 0;
        }

        if (progress < 0.5) {
            const local = progress / 0.5;
            return this._easeOutQuad(local);
        }

        const local = (progress - 0.5) / 0.5;
        return 1 - this._easeInQuad(local);
    }

    /**
     * @param {number} t
     * @returns {number}
     */
    _easeInQuad(t) {
        return t * t;
    }

    /**
     * @param {number} t
     * @returns {number}
     */
    _easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    }
}
