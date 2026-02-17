/**
 * ExplosionSystem.js — gere les particules et l'onde de choc lors d'un impact.
 * Les particules simulent la gravité, rebonds et friction pour un effet réaliste.
 */

import { Node } from '../engine/Node.js';
import { Cube } from '../shapes/Cube.js';
import { PARTICLE_PHYSICS } from './config/Constants.js';

/**
 * @typedef {Object} ParticleMotion
 * @property {Cube} cube
 * @property {{x: number, y: number, z: number}} position
 * @property {{x: number, y: number, z: number}} velocity
 * @property {{x: number, y: number, z: number}} rotation
 * @property {{x: number, y: number, z: number}} spin
 * @property {number} gravity
 * @property {number} startTime
 * @property {number} lastTime
 * @property {number} lifeMs
 */

/**
 * @typedef {Object} ExplosionConfig
 * @property {number} particleCount
 * @property {Array<string>} particleColors
 * @property {number} gravity
 */

export class ExplosionSystem {
    /**
     * @type {import('../engine/Scene.js').Scene}
     */
    _scene;

    /**
     * @type {import('./AnimationClock.js').AnimationClock}
     */
    _clock;

    /**
     * @type {number}
     */
    _cellSize;

    /**
     * @type {number}
     */
    _groundY;

    /**
     * @type {Set<ParticleMotion>}
     */
    _activeParticles;

    /**
     * @param {import('../engine/Scene.js').Scene} scene
     * @param {import('./AnimationClock.js').AnimationClock} clock
     * @param {number} cellSize
     * @param {number} groundY
     */
    constructor(scene, clock, cellSize, groundY) {
        this._scene = scene;
        this._clock = clock;
        this._cellSize = cellSize;
        this._groundY = groundY;
        this._activeParticles = new Set();
        this._tick = this._tick.bind(this);
    }

    /**
     * @param {{x: number, y: number, z: number}} impact
     * @param {Partial<ExplosionConfig>} config
     * @returns {void}
     */
    spawnExplosion(impact, config = {}) {
        const particleCount = config.particleCount ?? 14;
        const particleColors = config.particleColors ?? ['#ffcc66', '#ffd34d', '#ff9966', '#ff6b6b', '#ffe3a3'];
        const gravity = config.gravity ?? 2200;
        const minSize = Math.max(6, Math.round(this._cellSize * 0.12));
        const maxSize = Math.max(12, Math.round(this._cellSize * 0.28));

        this._spawnShockwave(impact);

        for (let index = 0; index < particleCount; index += 1) {
            const particleSize = minSize + Math.round(Math.random() * (maxSize - minSize));
            const particle = new Cube(particleSize);
            particle.setColor(particleColors[index % particleColors.length]);
            particle.setPosition(impact.x, impact.y, impact.z);
            this._scene.add(particle);

            const direction = this._randomUnitVector();
            const speed = 260 + Math.random() * 340;

            const now = window.performance.now();
            const motion = {
                cube: particle,
                position: { ...impact },
                velocity: {
                    x: direction.x * speed,
                    y: direction.y * speed - 650,
                    z: direction.z * speed,
                },
                rotation: {
                    x: Math.random() * 360,
                    y: Math.random() * 360,
                    z: Math.random() * 360,
                },
                spin: {
                    x: (Math.random() * 2 - 1) * 360,
                    y: (Math.random() * 2 - 1) * 360,
                    z: (Math.random() * 2 - 1) * 360,
                },
                gravity,
                startTime: now,
                lastTime: now,
                lifeMs: 600 + Math.random() * 300,
            };

            this._activeParticles.add(motion);
        }

        this._clock.add(this._tick);
    }

    /**
     * @param {number} timeMs
     * @returns {void}
     */
    _tick(timeMs) {
        for (const motion of this._activeParticles) {
            this._updateParticle(motion, timeMs);
        }

        if (this._activeParticles.size === 0) {
            this._clock.remove(this._tick);
        }
    }

    /**
     * @param {ParticleMotion} motion
     * @param {number} timeMs
     * @returns {void}
     */
    _updateParticle(motion, timeMs) {
        const elapsed = timeMs - motion.startTime;
        if (elapsed >= motion.lifeMs) {
            this._scene.remove(motion.cube);
            this._activeParticles.delete(motion);
            return;
        }

        const deltaSeconds = Math.min(PARTICLE_PHYSICS.maxDeltaSeconds, (timeMs - motion.lastTime) / 1000);
        if (deltaSeconds <= 0) {
            return;
        }
        motion.lastTime = timeMs;

        motion.velocity.y += motion.gravity * deltaSeconds;
        motion.position.x += motion.velocity.x * deltaSeconds;
        motion.position.y += motion.velocity.y * deltaSeconds;
        motion.position.z += motion.velocity.z * deltaSeconds;

        if (motion.position.y > this._groundY) {
            motion.position.y = this._groundY;
            motion.velocity.y *= -PARTICLE_PHYSICS.bounceDamping;
            motion.velocity.x *= PARTICLE_PHYSICS.friction;
            motion.velocity.z *= PARTICLE_PHYSICS.friction;
        }

        motion.rotation.x += motion.spin.x * deltaSeconds;
        motion.rotation.y += motion.spin.y * deltaSeconds;
        motion.rotation.z += motion.spin.z * deltaSeconds;

        motion.cube.setPosition(motion.position.x, motion.position.y, motion.position.z);
        motion.cube.setRotation(motion.rotation.x, motion.rotation.y, motion.rotation.z);
        motion.cube.el.style.opacity = String(1 - elapsed / motion.lifeMs);
    }

    /**
     * @param {{x: number, y: number, z: number}} impact
     * @returns {void}
     */
    _spawnShockwave(impact) {
        const shockwave = new Node();
        const size = Math.round(this._cellSize * 1.2);

        shockwave.el.style.width = `${size}px`;
        shockwave.el.style.height = `${size}px`;
        shockwave.el.style.borderRadius = '50%';
        shockwave.el.style.border = '2px solid rgba(255, 210, 140, 0.8)';
        shockwave.el.style.boxShadow = '0 0 12px rgba(255, 180, 80, 0.6)';
        shockwave.el.style.pointerEvents = 'none';
        shockwave.el.style.opacity = '1';
        shockwave.el.style.transformOrigin = '50% 50%';

        shockwave.setPosition(impact.x, this._groundY, impact.z);
        shockwave.setRotation(90, 0, 0);
        this._scene.add(shockwave);

        const baseTransform = shockwave.el.style.transform;
        shockwave.el.style.transform = `${baseTransform} scale3d(0.2, 0.2, 0.2)`;

        window.requestAnimationFrame(() => {
            shockwave.el.style.transition = 'transform 0.45s ease-out, opacity 0.45s ease-out';
            shockwave.el.style.opacity = '0';
            shockwave.el.style.transform = `${baseTransform} scale3d(2.6, 2.6, 2.6)`;
        });

        shockwave.onTransitionEnd(() => {
            this._scene.remove(shockwave);
        });
    }

    /**
     * @returns {{x: number, y: number, z: number}}
     */
    _randomUnitVector() {
        let x = 0;
        let y = 0;
        let z = 0;
        let length = 0;

        while (length === 0) {
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            z = Math.random() * 2 - 1;
            length = Math.hypot(x, y, z);
        }

        return { x: x / length, y: y / length, z: z / length };
    }
}
