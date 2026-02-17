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
import { TargetCubeCounter } from './TargetCubeCounter.js';
import { TargetCubeStats } from './TargetCubeStats.js';
import { GridStateManager } from './GridStateManager.js';
import { GameTurnManager } from './GameTurnManager.js';
import { GameTurnUI } from './GameTurnUI.js';
import { GridCellManager } from './GridCellManager.js';
import { DropMissileSystem } from './DropMissileSystem.js';
import {
    GRID_CONFIG, ANIMATION_CONFIG, MISSILE_CONFIGS, SIZE_FACTORS,
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
     * @type {Map<string, Cube>}
     * Référence à tous les cubes de la scène indexés par clé du layout
     */
    _cubes;

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
     * @type {TargetCubeCounter}
     */
    _cubeCounter;

    /**
     * @type {TargetCubeStats}
     */
    _stats;

    /**
     * @type {GridStateManager}
     */
    _gridStateManager;

    /**
     * @type {GridCellManager}
     */
    _cellManager;

    /**
     * @type {GameTurnManager}
     */
    _turnManager;

    /**
     * @type {GameTurnUI}
     */
    _turnUI;

    /**
     * @type {DropMissileSystem}
     */
    _dropMissileSystem;

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

        this._gridStateManager = new GridStateManager();
        this._cellManager = new GridCellManager(this._columns, this._rows);
        this._grid = new Grid(this._columns, this._rows, this._cellSize);
        this._scene.add(this._grid);
        this._disableGridPointerEvents();

        this._cubes = new Map();
        this._initializeGridCubes();

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
        this._dropMissileSystem = new DropMissileSystem(
            this._scene,
            this._clock,
            this._explosionSystem,
            this._impactSystem,
            this._cellSize,
            this._groundY,
        );
        this._targetingSystem = new TargetingSystem(this._enemies);
        this._controls = new OrbitControls(this._viewport);

        // Initialise le système de comptage des cubes cibles
        this._cubeCounter = new TargetCubeCounter();
        this._stats = new TargetCubeStats(this._cubeCounter, document.body);

        // Initialise le système de gestion des tours
        this._turnManager = new GameTurnManager();
        this._turnUI = new GameTurnUI(() => {
            this._turnManager.nextTurn();
        });

        // S'abonne aux événements de début de tour pour déclencher les feux d'artifice
        this._turnManager.subscribeTurnStarted(() => {
            this._fireFireworksBurst();
        });

        // Ajoute l'écouteur de clic sur la grille pour les missiles qui tombent
        this._grid.el.addEventListener('pointerdown', (event) => {
            this._handleGridClick(event);
        });
    }

    /**
     * @returns {void}
     */
    init() {
        this._positionCubes();
        
        // Réactive les événements pointeur sur la grille et les cellules pour détecter les clics
        this._grid.el.style.pointerEvents = 'auto';
        const gridCells = this._grid.el.querySelectorAll('.db-grid-cell');
        for (const cell of gridCells) {
            cell.style.pointerEvents = 'auto';
        }
        
        // Active les interactions seulement pour les cubes qui existent dans le layout
        if (this._leftCube) {
            this._enableCubeInteraction(this._leftCube);
            this._registerCubeClicks(this._leftCube, () => this._rightCube);
        }
        if (this._rightCube) {
            this._enableCubeInteraction(this._rightCube);
            this._registerCubeClicks(this._rightCube, () => this._targetingSystem.pickRandomEnemy());
        }
        if (this._obstacle) {
            this._enableCubeInteraction(this._obstacle);
            this._registerCubeClicks(this._obstacle, () => this._fireFireworksBurst());
        }
    }

    /**
     * Initialise tous les cubes depuis le layout actuel du GridStateManager.
     * Crée les cubes avec leur taille et couleur, les ajoute à la scène.
     * Stocke les références par clé pour accès facile.
     * @returns {void}
     */
    _initializeGridCubes() {
        const currentLayout = this._gridStateManager.getCurrentLayout();
        for (const [key, descriptor] of Object.entries(currentLayout)) {
            const cube = this._createCubeFromDescriptor(descriptor);
            this._cubes.set(key, cube);
        }

        // Aliases pour accès facile aux cubes nommés
        this._leftCube = this._cubes.get('leftShooter');
        this._rightCube = this._cubes.get('rightShooter');
        this._obstacle = this._cubes.get('obstacle');
        this._enemies = [
            this._cubes.get('enemyTop'),
            this._cubes.get('enemyBottom'),
        ];
    }

    /**
     * Crée un cube selon un descripteur du layout.
     * @param {Object} descriptor - Descripteur avec color, sizeScale, etc.
     * @returns {Cube}
     */
    _createCubeFromDescriptor(descriptor) {
        const size = this._cellSize * descriptor.sizeScale;
        const cube = new Cube(size);
        cube.setColor(descriptor.color);
        this._scene.add(cube);
        return cube;
    }

    /**
     * Positionne tous les cubes selon le layout actuel.
     * Convertit les coordonnées grid (col, row) en world coordinates.
     * @returns {void}
     */
    _positionCubes() {
        const currentLayout = this._gridStateManager.getCurrentLayout();
        for (const [key, descriptor] of Object.entries(currentLayout)) {
            const cube = this._cubes.get(key);
            const worldPos = this._grid.cellToWorld(descriptor.column, descriptor.row);
            cube.setPosition(worldPos.x, worldPos.y, worldPos.z);
        }
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
     * Chaque cube cible a un type aléatoire, est placé dans une cellule de la grille,
     * et est enregistré dans le gestionnaire de cellules et le compteur.
     * @returns {void}
     */
    _fireFireworksBurst() {
        for (let i = 0; i < ANIMATION_CONFIG.fireworksCount; i++) {
            const targetCube = new TargetCube();
            const randomCol = Math.floor(Math.random() * this._columns);
            const randomRow = Math.floor(Math.random() * this._rows);
            
            // Ajoute le cube à la cellule de la grille
            const stackIndex = this._cellManager.addCubeToCell(randomCol, randomRow, targetCube.getCube(), targetCube.getType());
            targetCube.placeInCell(randomCol, randomRow, stackIndex);
            
            // Mémorise la position 3D
            this._updateCubePosition3D(targetCube);
            
            this._scene.add(targetCube.getCube());
            
            // Notifie le compteur qu'un cube cible a été créé
            this._cubeCounter.increment(targetCube.getType());
            
            this._projectileSystem.fire(this._obstacle, targetCube.getCube(), this._missileConfigs.default);
        }
    }

    /**
     * Met à jour la position 3D d'un cube cible basée sur sa cellule et son indice dans la pile.
     * @param {TargetCube} targetCube - Le cube cible à positionner
     * @returns {void}
     * @private
     */
    _updateCubePosition3D(targetCube) {
        const col = targetCube.getGridColumn();
        const row = targetCube.getGridRow();
        const stackIndex = targetCube.getStackIndex();
        
        const worldPos = this._grid.cellToWorld(col, row);
        
        // Calcule la hauteur Y en fonction de l'indice dans la pile
        const cubeSize = this._cellSize * SIZE_FACTORS.targetCube;
        const stackHeight = stackIndex * cubeSize;
        
        targetCube.getCube().setPosition(worldPos.x, stackHeight, worldPos.z);
    }

    /**
     * Gère le clic sur la grille: lance un missile qui tombe verticalement.
     * @param {PointerEvent} event - L'événement de clic
     * @returns {void}
     * @private
     */
    _handleGridClick(event) {
        event.preventDefault();
        event.stopPropagation();

        // Trouve la cellule cliquée en remontant l'arbre DOM
        const clickedCell = event.target.closest('.db-grid-cell');
        if (!clickedCell) {
            return;
        }

        const col = Number(clickedCell.dataset.col);
        const row = Number(clickedCell.dataset.row);

        // Convertit la coordonnée grille en position world
        const worldPos = this._grid.cellToWorld(col, row);

        // Lance le missile
        this._dropMissileSystem.dropMissile(worldPos.x, worldPos.z);
    }

    /**
     * Charge un layout de grille spécifique par clé.
     * Détruit tous les cubes actuels et en crée une nouvelle grille selon le layout.
     * @param {string} layoutKey - Clé du layout ('full', 'minimal', etc)
     * @returns {void}
     */
    loadLayout(layoutKey) {
        console.warn(`Changement vers layout "${layoutKey}"...`);
        this._gridStateManager.loadLayout(layoutKey);
        this._rebuildGrid();
    }

    /**
     * Reconstruit la grille: supprime tous les cubes et les recréé selon le layout actuel.
     * @returns {void}
     */
    _rebuildGrid() {
        // Supprime tous les cubes actuels
        for (const cube of this._cubes.values()) {
            this._scene.remove(cube);
        }
        this._cubes.clear();

        // Réinitialise le gestionnaire de cellules
        this._cellManager.reset();

        // Réinitialise les références
        this._leftCube = null;
        this._rightCube = null;
        this._obstacle = null;
        this._enemies = [];

        // Réinitialise le compteur
        this._cubeCounter.reset();

        // Crée les nouveaux cubes selon le layout
        this._initializeGridCubes();
        this._positionCubes();

        // Re-registre les interactions
        if (this._leftCube) {
            this._enableCubeInteraction(this._leftCube);
            this._registerCubeClicks(this._leftCube, () => this._rightCube);
        }
        if (this._rightCube) {
            this._enableCubeInteraction(this._rightCube);
            this._registerCubeClicks(this._rightCube, () => this._targetingSystem.pickRandomEnemy());
        }
        if (this._obstacle) {
            this._enableCubeInteraction(this._obstacle);
            this._registerCubeClicks(this._obstacle, () => this._fireFireworksBurst());
        }

        console.warn('Grille reconstruite');
    }
}
