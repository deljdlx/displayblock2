/**
 * ProjectileSystem.js — gere les tirs et leurs trajectoires paraboliques.
 * Calcule les trajectoires avec effets de gravité, gère l'impact et les animations.
 */

import { Cube } from '../shapes/Cube.js';
import { SIZE_FACTORS, PARTICLE_PHYSICS, ANIMATION_CONFIG } from './config/Constants.js';

/**
 * @typedef {Object} ProjectileMotion
 * @property {Cube} cube
 * @property {{x: number, y: number, z: number}} start
 * @property {{x: number, y: number, z: number}} end
 * @property {Cube} target
 * @property {number} startTime
 * @property {number} lastTime
 * @property {number} durationMs
 * @property {number} arcHeight
 * @property {number} gravityFactor
 * @property {{particleCount: number, particleColors: Array<string>, gravity: number}} explosionConfig
 * @property {{x: number, y: number, z: number}} rotation
 * @property {{x: number, y: number, z: number}} spin
 */

/**
 * @typedef {Object} MissileConfig
 * @property {number} durationMs
 * @property {number} arcHeight
 * @property {string} color
 * @property {number} gravity
 * @property {number} particleCount
 * @property {Array<string>} particleColors
 * @property {{x: number, y: number, z: number}} spinSpeed
 * @property {boolean} randomRotation
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
     * @type {MissileConfig}
     */
    _defaultMissile;

    /**
     * @type {Set<ProjectileMotion>}
     */
    _activeProjectiles;

    /**
     * @param {import('../engine/Scene.js').Scene} scene
     * @param {import('./AnimationClock.js').AnimationClock} clock
     * @param {import('./ExplosionSystem.js').ExplosionSystem} explosionSystem
     * @param {import('./ImpactShakeSystem.js').ImpactShakeSystem} impactSystem
     * @param {{cellSize: number, defaultMissile: MissileConfig}} options
     */
    constructor(scene, clock, explosionSystem, impactSystem, options) {
        this._scene = scene;
        this._clock = clock;
        this._explosionSystem = explosionSystem;
        this._impactSystem = impactSystem;
        this._cellSize = options.cellSize;
        this._defaultMissile = options.defaultMissile;
        this._activeProjectiles = new Set();
        this._tick = this._tick.bind(this);
    }

    /**
     * @param {Cube} source
     * @param {Cube} target
     * @param {Partial<MissileConfig>} config
     * @returns {void}
     */
    fire(source, target, config = {}) {
        if (!source || !target) {
            return;
        }

        const missileConfig = this._resolveMissileConfig(config);

        const projectileSize = Math.max(14, Math.round(this._cellSize * SIZE_FACTORS.projectile));
        const projectile = new Cube(projectileSize);
        projectile.setColor(missileConfig.color);

        const offsetY = Math.round(this._cellSize * SIZE_FACTORS.projectile);
        const start = {
            x: source.position.x,
            y: source.position.y - offsetY,
            z: source.position.z,
        };
        const end = {
            x: target.position.x,
            y: target.position.y - offsetY,
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
            lastTime: window.performance.now(),
            durationMs: missileConfig.durationMs,
            arcHeight: missileConfig.arcHeight,
            gravityFactor: missileConfig.gravity,
            explosionConfig: {
                particleCount: missileConfig.particleCount,
                particleColors: missileConfig.particleColors,
                gravity: PARTICLE_PHYSICS.gravityBase * missileConfig.gravity,
            },
            rotation: {
                x: missileConfig.randomRotation ? Math.random() * 360 : 0,
                y: missileConfig.randomRotation ? Math.random() * 360 : 0,
                z: missileConfig.randomRotation ? Math.random() * 360 : 0,
            },
            spin: {
                x: (Math.random() * 2 - 1) * missileConfig.spinSpeed.x,
                y: (Math.random() * 2 - 1) * missileConfig.spinSpeed.y,
                z: (Math.random() * 2 - 1) * missileConfig.spinSpeed.z,
            },
        };

        this._activeProjectiles.add(motion);
        this._clock.add(this._tick);

        // Animation de recul du cube source (optionnelle si source est un simple point d'impact)
        if (typeof source.animateSize === 'function') {
            source.animateSize(
                this._cellSize * ANIMATION_CONFIG.sourceFireScaleUp,
                this._cellSize * ANIMATION_CONFIG.sourceFireScaleUp,
                this._cellSize * ANIMATION_CONFIG.sourceFireScaleUp,
                ANIMATION_CONFIG.fireAnimationDuration,
            );
            source.onTransitionEnd(() => {
                source.clearFaceTransition();
                source.setSize(this._cellSize, this._cellSize, this._cellSize);
            });
        }
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
        const lift = (motion.arcHeight / Math.max(0.1, motion.gravityFactor)) * this._computeGravityLift(progress);

        const x = motion.start.x + (motion.end.x - motion.start.x) * progress;
        const z = motion.start.z + (motion.end.z - motion.start.z) * progress;
        const y = motion.start.y + (motion.end.y - motion.start.y) * progress - lift;

        const deltaSeconds = Math.min(PARTICLE_PHYSICS.maxDeltaSeconds, (timeMs - motion.lastTime) / 1000);
        motion.lastTime = timeMs;

        motion.cube.setPosition(x, y, z);
        motion.rotation.x += motion.spin.x * deltaSeconds;
        motion.rotation.y += motion.spin.y * deltaSeconds;
        motion.rotation.z += motion.spin.z * deltaSeconds;
        motion.cube.setRotation(motion.rotation.x, motion.rotation.y, motion.rotation.z);

        if (progress >= 1) {
            this._explosionSystem.spawnExplosion(motion.end, motion.explosionConfig);
            this._impactSystem.applyTo(motion.target);
            // Révèle le cube cible si c'est une TargetCube, sinon manipule l'opacity directement
            if (motion.target && motion.target.el) {
                motion.target.el.style.opacity = '1';
            }
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

    /**
     * @param {Partial<MissileConfig>} config
     * @returns {MissileConfig}
     */
    _resolveMissileConfig(config) {
        return {
            durationMs: config.durationMs ?? this._defaultMissile.durationMs,
            arcHeight: config.arcHeight ?? this._defaultMissile.arcHeight,
            color: config.color ?? this._defaultMissile.color,
            gravity: config.gravity ?? this._defaultMissile.gravity,
            particleCount: config.particleCount ?? this._defaultMissile.particleCount,
            particleColors: config.particleColors ?? this._defaultMissile.particleColors,
            spinSpeed: config.spinSpeed ?? this._defaultMissile.spinSpeed,
            randomRotation: config.randomRotation ?? this._defaultMissile.randomRotation,
        };
    }
}
