/**
 * ImpactShakeSystem.js — applique une vibration visuelle aux cubes touches.
 */

export class ImpactShakeSystem {
    /**
     * @type {number}
     */
    _cellSize;

    /**
     * @type {WeakMap<import('../shapes/Cube.js').Cube, number>}
     */
    _activeShakes;

    /**
     * @param {number} cellSize
     */
    constructor(cellSize) {
        this._cellSize = cellSize;
        this._activeShakes = new WeakMap();
    }

    /**
     * @param {import('../shapes/Cube.js').Cube} target
     * @returns {void}
     */
    applyTo(target) {
        if (!target) {
            return;
        }

        const previousId = this._activeShakes.get(target);
        if (previousId) {
            window.cancelAnimationFrame(previousId);
        }

        const startTime = window.performance.now();
        const durationMs = 220;
        const amplitude = this._cellSize * 0.06;
        const rotationAmplitude = 6;
        const basePosition = { x: target.position.x, y: target.position.y, z: target.position.z };
        const baseRotation = { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z };

        const tick = (timeMs) => {
            const progress = Math.min(1, (timeMs - startTime) / durationMs);
            const damping = 1 - progress;

            const offsetX = (Math.random() * 2 - 1) * amplitude * damping;
            const offsetY = (Math.random() * 2 - 1) * amplitude * 0.5 * damping;
            const offsetZ = (Math.random() * 2 - 1) * amplitude * damping;

            const rotX = (Math.random() * 2 - 1) * rotationAmplitude * damping;
            const rotY = (Math.random() * 2 - 1) * rotationAmplitude * damping;
            const rotZ = (Math.random() * 2 - 1) * rotationAmplitude * damping;

            target.setPosition(
                basePosition.x + offsetX,
                basePosition.y + offsetY,
                basePosition.z + offsetZ,
            );
            target.setRotation(
                baseRotation.x + rotX,
                baseRotation.y + rotY,
                baseRotation.z + rotZ,
            );

            if (progress >= 1) {
                target.setPosition(basePosition.x, basePosition.y, basePosition.z);
                target.setRotation(baseRotation.x, baseRotation.y, baseRotation.z);
                this._activeShakes.delete(target);
                return;
            }

            const nextId = window.requestAnimationFrame(tick);
            this._activeShakes.set(target, nextId);
        };

        const id = window.requestAnimationFrame(tick);
        this._activeShakes.set(target, id);
    }
}
