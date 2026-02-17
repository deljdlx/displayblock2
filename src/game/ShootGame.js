/**
 * ShootGame.js — assemble la scene et orchestre les interactions du mini-jeu.
 * Gère le placement des cubes, l'enregistrement des interactions et la coordination
 * entre les différents systèmes de jeu (projectiles, explosions, impacts).
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
import { TargetCube } from './TargetCube.js';
import {
    GRID_CONFIG, CUBE_POSITIONS, COLORS, ANIMATION_CONFIG, MISSILE_CONFIGS, SIZE_FACTORS,
} from './config/Constants.js';

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
     * @type {Cube}
     */
    _obstacle;

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
     * @type {{default: import('./ProjectileSystem.js').MissileConfig}}
     */
    _missileConfigs;

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

        this._columns = GRID_CONFIG.columns;
        this._rows = GRID_CONFIG.rows;
        this._cellSize = GRID_CONFIG.cellSize;
        this._groundY = GRID_CONFIG.groundY;

        this._grid = new Grid(this._columns, this._rows, this._cellSize);
        this._scene.add(this._grid);
        this._disableGridPointerEvents();

        this._leftCube = this._createCube(COLORS.leftShooter);
        this._rightCube = this._createCube(COLORS.rightShooter);
        this._enemies = [this._createCube(COLORS.enemy), this._createCube(COLORS.enemy)];
        this._obstacle = this._createObstacle();

        this._missileConfigs = {
            default: MISSILE_CONFIGS.default,
        };

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
                defaultMissile: this._missileConfigs.default,
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
        this._enableCubeInteraction(this._obstacle);

        this._registerCubeClicks(this._leftCube, () => this._rightCube);
        this._registerCubeClicks(this._rightCube, () => this._targetingSystem.pickRandomEnemy());
        this._registerCubeClicks(this._obstacle, () => this._fireFireworksBurst());
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
     * Creates a large red obstacle cube at grid center.
     * Serves as visual element and interactive fireworks trigger.
     * @returns {Cube}
     */
    _createObstacle() {
        const obstacleSize = this._cellSize * SIZE_FACTORS.obstacleScale;
        const obstacle = new Cube(obstacleSize);
        obstacle.setColor(COLORS.obstacle);
        this._scene.add(obstacle);
        return obstacle;
    }

    /**
     * Positionne tous les cubes selon la grille.
     * Left/Right shooters aux bords, enemies au centre, obstacle au centre exact.
     * @returns {void}
     */
    _positionCubes() {
        const leftCubePosition = this._grid.cellToWorld(CUBE_POSITIONS.leftEdge, CUBE_POSITIONS.centerRow);
        const rightCubePosition = this._grid.cellToWorld(CUBE_POSITIONS.rightEdge, CUBE_POSITIONS.centerRow);

        this._leftCube.setPosition(leftCubePosition.x, leftCubePosition.y, leftCubePosition.z);
        this._rightCube.setPosition(rightCubePosition.x, rightCubePosition.y, rightCubePosition.z);

        const innerTopPosition = this._grid.cellToWorld(CUBE_POSITIONS.centerColumn, CUBE_POSITIONS.enemyTopRow);
        const innerBottomPosition = this._grid.cellToWorld(
            CUBE_POSITIONS.centerColumn,
            CUBE_POSITIONS.enemyBottomRow,
        );

        this._enemies[0].setPosition(innerTopPosition.x, innerTopPosition.y, innerTopPosition.z);
        this._enemies[1].setPosition(innerBottomPosition.x, innerBottomPosition.y, innerBottomPosition.z);

        const obstaclePosition = this._grid.cellToWorld(CUBE_POSITIONS.centerColumn, CUBE_POSITIONS.centerRow);
        this._obstacle.setPosition(obstaclePosition.x, obstaclePosition.y, obstaclePosition.z);
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
     * Enregistre les handlers de clic sur les faces d'un cube.
     * Lors du clic, exécute la callback qui peut retourner une cible (pour tirer un projectile)
     * ou undefined (pour autre action comme le feu d'artifice).
     * @param {Cube} cube - Cube à rendre cliquable
     * @param {() => (Cube|null|void)} handler - Callback exécutée au clic
     * @returns {void}
     */
    _registerCubeClicks(cube, handler) {
        const eventHandler = (event) => {
            event.preventDefault();
            event.stopPropagation();
            const result = handler();
            // Si result est un Cube, on lance un projectile vers cette cible
            if (result instanceof Cube) {
                this._projectileSystem.fire(cube, result, this._missileConfigs.default);
            }
        };

        for (const face of Object.values(cube.faces)) {
            face.addEventListener('pointerdown', eventHandler);
        }
    }

    /**
     * Lance un feu d'artifice: 10 projectiles vers des positions aléatoires.
     * Utilisé pour l'interaction du cube obstacle.
     * @returns {void}
     */
    _fireFireworksBurst() {
        for (let i = 0; i < ANIMATION_CONFIG.fireworksCount; i++) {
            const targetCube = new TargetCube(this._grid);
            targetCube.positionRandomly();
            this._scene.add(targetCube.getCube());
            this._projectileSystem.fire(this._obstacle, targetCube.getCube(), this._missileConfigs.default);
        }
    }
}
