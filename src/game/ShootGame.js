/**
 * ShootGame.js — assemble la scene et orchestre les interactions du mini-jeu.
 */

import { Viewport } from '../engine/Viewport.js';
import { Scene } from '../engine/Scene.js';
import { OrbitControls } from '../interaction/OrbitControls.js';
import { Grid } from '../shapes/Grid.js';
import { Cube } from '../shapes/Cube.js';
import { AnimationClock } from './AnimationClock.js';
import { ExplosionSystem } from './ExplosionSystem.js';
import { ImpactShakeSystem } from './ImpactShakeSystem.js';
import { ProjectileSystem } from './ProjectileSystem.js';
import { TargetingSystem } from './TargetingSystem.js';

export class ShootGame {
    /**
     * @type {HTMLElement}
     */
    _app;

    /**
     * @type {Viewport}
     */
    _viewport;

    /**
     * @type {Scene}
     */
    _scene;

    /**
     * @type {Grid}
     */
    _grid;

    /**
     * @type {Cube}
     */
    _leftCube;

    /**
     * @type {Cube}
     */
    _rightCube;

    /**
     * @type {Array<Cube>}
     */
    _enemies;

    /**
     * @type {AnimationClock}
     */
    _clock;

    /**
     * @type {ExplosionSystem}
     */
    _explosionSystem;

    /**
     * @type {ImpactShakeSystem}
     */
    _impactSystem;

    /**
     * @type {ProjectileSystem}
     */
    _projectileSystem;

    /**
     * @type {TargetingSystem}
     */
    _targetingSystem;

    /**
     * @type {OrbitControls}
     */
    _controls;

    /**
     * @type {number}
     */
    _columns;

    /**
     * @type {number}
     */
    _rows;

    /**
     * @type {number}
     */
    _cellSize;

    /**
     * @type {number}
     */
    _groundY;

    /**
     * @param {HTMLElement} app
     */
    constructor(app) {
        this._app = app;
        this._viewport = new Viewport(app);
        this._scene = new Scene('shoot');
        this._viewport.addScene(this._scene);
        this._viewport.camera.style.pointerEvents = 'auto';
        this._scene.el.style.pointerEvents = 'auto';

        this._columns = 20;
        this._rows = 20;
        this._cellSize = 40;
        this._groundY = 0;

        this._grid = new Grid(this._columns, this._rows, this._cellSize);
        this._scene.add(this._grid);
        this._disableGridPointerEvents();

        this._leftCube = this._createCube('#32b9ff');
        this._rightCube = this._createCube('#ff7a32');
        this._enemies = [this._createCube('#2f6cff'), this._createCube('#2f6cff')];

        this._clock = new AnimationClock();
        this._impactSystem = new ImpactShakeSystem(this._cellSize);
        this._explosionSystem = new ExplosionSystem(this._scene, this._clock, this._cellSize, this._groundY);
        this._projectileSystem = new ProjectileSystem(
            this._scene,
            this._clock,
            this._explosionSystem,
            this._impactSystem,
            {
                cellSize: this._cellSize,
                durationMs: 1200,
                arcHeight: this._cellSize * 5,
            },
        );
        this._targetingSystem = new TargetingSystem(this._enemies);
        this._controls = new OrbitControls(this._viewport);
    }

    /**
     * @returns {void}
     */
    init() {
        this._positionCubes();
        this._enableCubeInteraction(this._leftCube);
        this._enableCubeInteraction(this._rightCube);

        this._registerFaceClicks(this._leftCube, () => this._rightCube);
        this._registerFaceClicks(this._rightCube, () => this._targetingSystem.pickRandomEnemy());
    }

    /**
     * @param {string} color
     * @returns {Cube}
     */
    _createCube(color) {
        const cube = new Cube(this._cellSize);
        cube.setColor(color);
        this._scene.add(cube);
        return cube;
    }

    /**
     * @returns {void}
     */
    _positionCubes() {
        const leftEdgeCol = 0;
        const rightEdgeCol = this._columns - 1;
        const middleRow = Math.floor(this._rows / 2);

        const leftCubePosition = this._grid.cellToWorld(leftEdgeCol, middleRow);
        const rightCubePosition = this._grid.cellToWorld(rightEdgeCol, middleRow);

        this._leftCube.setPosition(leftCubePosition.x, leftCubePosition.y, leftCubePosition.z);
        this._rightCube.setPosition(rightCubePosition.x, rightCubePosition.y, rightCubePosition.z);

        const centerColumn = Math.floor(this._columns / 2);
        const innerTopPosition = this._grid.cellToWorld(centerColumn, 3);
        const innerBottomPosition = this._grid.cellToWorld(centerColumn, this._rows - 4);

        this._enemies[0].setPosition(innerTopPosition.x, innerTopPosition.y, innerTopPosition.z);
        this._enemies[1].setPosition(innerBottomPosition.x, innerBottomPosition.y, innerBottomPosition.z);
    }

    /**
     * @returns {void}
     */
    _disableGridPointerEvents() {
        this._grid.el.style.pointerEvents = 'none';
        const gridCells = this._grid.el.querySelectorAll('.db-grid-cell');
        for (const cell of gridCells) {
            cell.style.pointerEvents = 'none';
        }
    }

    /**
     * @param {Cube} cube
     * @returns {void}
     */
    _enableCubeInteraction(cube) {
        cube.el.style.pointerEvents = 'auto';
        for (const face of Object.values(cube.faces)) {
            face.style.cursor = 'pointer';
        }
    }

    /**
     * @param {Cube} source
     * @param {() => Cube|null} resolveTarget
     * @returns {void}
     */
    _registerFaceClicks(source, resolveTarget) {
        const handler = (event) => {
            event.preventDefault();
            event.stopPropagation();
            const target = resolveTarget();
            if (!target) {
                return;
            }
            this._projectileSystem.fire(source, target);
        };

        for (const face of Object.values(source.faces)) {
            face.addEventListener('pointerdown', handler);
        }
    }
}
