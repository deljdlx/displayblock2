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
import { SecondaryExplosion } from './SecondaryExplosion.js';
import {
    GRID_CONFIG, ANIMATION_CONFIG, MISSILE_CONFIGS,
    SUB_CUBE_CONFIG, POSITIONS_PER_LEVEL,
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

        this._columns = GRID_CONFIG.columns;
        this._rows = GRID_CONFIG.rows;
        this._cellSize = GRID_CONFIG.cellSize;
        this._groundY = GRID_CONFIG.groundY;

        this._gridStateManager = new GridStateManager();
        this._cellManager = new GridCellManager(this._columns, this._rows);
        this._grid = new Grid(this._columns, this._rows, this._cellSize);
        this._scene.add(this._grid);

        this._cubes = new Map();
        this._initializeGridCubes();

        this._missileConfigs = {
            default: MISSILE_CONFIGS.default,
        };

        this._initializeSystems();
        this._initializeUI();
        this._setupEventListeners();
    }

    /**
     * Initialise les systèmes de jeu: horloge, explosions, impacts, projectiles, drop missiles, ciblage.
     * @returns {void}
     * @private
     */
    _initializeSystems() {
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
        this._dropMissileSystem.setOnMissileHit((impactX, impactZ) => {
            this._createSecondaryExplosion(impactX, impactZ);
        });

        this._targetingSystem = new TargetingSystem(this._enemies);
        this._controls = new OrbitControls(this._viewport);
    }

    /**
     * Initialise l'interface utilisateur: compteur de cubes, stats, tours.
     * @returns {void}
     * @private
     */
    _initializeUI() {
        this._cubeCounter = new TargetCubeCounter();
        this._stats = new TargetCubeStats(this._cubeCounter, document.body);

        this._turnManager = new GameTurnManager();
        this._turnUI = new GameTurnUI(() => {
            this._turnManager.nextTurn();
        });
    }

    /**
     * Enregistre les écouteurs d'événements globaux: début de tour et clic sur la grille.
     * @returns {void}
     * @private
     */
    _setupEventListeners() {
        this._turnManager.subscribeTurnStarted(() => {
            this._fireFireworksBurst();
        });

        this._viewport.el.addEventListener('pointerdown', (event) => {
            this._handleGridClick(event);
        });
    }

    /**
     * @returns {void}
     */
    init() {
        this._positionCubes();
        this._setupCubeInteractions();
    }

    /**
     * Active les interactions (pointer events + handlers de clic) pour les cubes du layout.
     * @returns {void}
     * @private
     */
    _setupCubeInteractions() {
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
     * Lance un feu d'artifice: N projectiles vers des positions aléatoires.
     * @returns {void}
     */
    _fireFireworksBurst() {
        for (let i = 0; i < ANIMATION_CONFIG.fireworksCount; i++) {
            const col = Math.floor(Math.random() * this._columns);
            const row = Math.floor(Math.random() * this._rows);
            const targetCube = this._createAndPlaceTargetCube(col, row);
            this._projectileSystem.fire(this._obstacle, targetCube.getCube(), this._missileConfigs.default);
        }
    }

    /**
     * Crée un TargetCube, le dimensionne, le place dans la cellule et l'ajoute à la scène.
     * @param {number} col - Colonne de la cellule cible
     * @param {number} row - Ligne de la cellule cible
     * @returns {TargetCube} Le cube créé (pour que l'appelant puisse lancer le projectile)
     * @private
     */
    _createAndPlaceTargetCube(col, row) {
        const targetCube = new TargetCube();

        const newCubeSize = (this._cellSize / 2) - SUB_CUBE_CONFIG.margin;
        targetCube.getCube().setSize(newCubeSize, newCubeSize, newCubeSize);

        const stackIndex = this._cellManager.addCubeToCell(col, row, targetCube.getCube(), targetCube.getType());
        targetCube.placeInCell(col, row, stackIndex);

        const subPos = SecondaryExplosion.getSubPosition(stackIndex);
        const level = Math.floor(stackIndex / POSITIONS_PER_LEVEL);

        this._updateCubePosition3DWithSubPosition(
            targetCube,
            subPos.subCol,
            subPos.subRow,
            level,
        );

        this._scene.add(targetCube.getCube());
        this._cubeCounter.increment(targetCube.getType());

        return targetCube;
    }

    /**
     * Met à jour la position 3D d'un cube cible au sein d'une grille 2x2 dans sa cellule.
     * Positionne les 4 cubes aux 4 quadrants autour du centre de la cellule.
     * 
     * @param {TargetCube} targetCube - Le cube cible
     * @param {number} subCol - Colonne dans la grille 2x2 (0 ou 1)
     * @param {number} subRow - Ligne dans la grille 2x2 (0 ou 1)
     * @param {number} stackIndex - Indice du cube dans la pile (étage)
     * @returns {void}
     * @private
     */
    _updateCubePosition3DWithSubPosition(targetCube, subCol, subRow, stackIndex) {
        const col = targetCube.getGridColumn();
        const row = targetCube.getGridRow();

        const worldPos = this._grid.cellToWorld(col, row);

        // Tailles
        const cubeSize = targetCube.getCube().width; // 18px
        const margin = SUB_CUBE_CONFIG.margin;
        
        // Distance entre les centres des cubes adjacents = taille + marge
        const spacing = cubeSize + margin; // 18 + 2 = 20

        // Positions des 4 cubes en grille 2x2
        const offsetX = (subCol - 0.5) * spacing;
        const offsetZ = (subRow - 0.5) * spacing;

        // Hauteur: le centre du cube doit être à -(cubeSize/2) pour reposer sur la grille (Y négatif = au-dessus)
        // L'empilement va vers le haut (Y de plus en plus négatif)
        const baseHeight = -(cubeSize / 2);
        const stackHeight = baseHeight - (stackIndex * cubeSize);

        const finalX = worldPos.x + offsetX;
        const finalZ = worldPos.z + offsetZ;

        targetCube.getCube().setPosition(
            finalX,
            stackHeight,
            finalZ,
        );
    }

    /**
     * Gère le clic sur la grille: lance un missile qui tombe verticalement.
     * @param {PointerEvent} event - L'événement de clic
     * @returns {void}
     * @private
     */
    _handleGridClick(event) {
        // Ignore si ce n'est pas le bouton gauche (button=0 pour gauche)
        if (event.button !== 0) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        // Essaie de trouver la cellule cliquée
        let clickedCell = event.target;
        
        // Si ce n'est pas directement une cellule, remonte l'arbre DOM
        if (!clickedCell.classList.contains('db-grid-cell')) {
            clickedCell = clickedCell.closest('.db-grid-cell');
        }

        // Si toujours pas de cellule, on ne traite pas le clic
        if (!clickedCell) {
            return;
        }

        // Récupère les coordonnées de la cellule
        const col = parseInt(clickedCell.dataset.col, 10);
        const row = parseInt(clickedCell.dataset.row, 10);

        // Valide les coordonnées
        if (isNaN(col) || isNaN(row)) {
            console.warn('Coordonnées de cellule invalides:', { col, row });
            return;
        }

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

        this._setupCubeInteractions();

        console.warn('Grille reconstruite');
    }

    /**
     * Crée une explosion en cascade suite à l'impact d'un missile du joueur.
     * Crée 10 TargetCube aléatoires dans un rayon de 3 cellules et tire des projectiles depuis le point d'impact.
     *
     * @param {number} impactX - Position X de l'impact en world coordinates
     * @param {number} impactZ - Position Z de l'impact en world coordinates
     * @returns {void}
     * @private
     */
    _createSecondaryExplosion(impactX, impactZ) {
        // Convertit la position d'impact world en coordonnées grille
        const impact = SecondaryExplosion.worldToCell(
            impactX,
            impactZ,
            this._columns,
            this._rows,
            this._cellSize,
        );

        // Génère 10 positions aléatoires dans un rayon de 3 cellules autour de l'impact
        const positions = SecondaryExplosion.generateRandomPositions(
            impact.col,
            impact.row,
            3,
            this._columns,
            this._rows,
            ANIMATION_CONFIG.fireworksCount,
        );

        // Source temporaire au point d'impact pour les tirs de projectiles
        const impactSource = { position: { x: impactX, y: 0, z: impactZ } };

        for (const pos of positions) {
            const targetCube = this._createAndPlaceTargetCube(pos.col, pos.row);
            this._projectileSystem.fire(impactSource, targetCube.getCube(), this._missileConfigs.default);
        }
    }
}
