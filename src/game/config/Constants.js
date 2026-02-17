/**
 * Constants.js — Configuration centralisée des constantes du jeu.
 * Évite les magic numbers et rend la configuration maintenable.
 */

import { TARGET_CUBE_TYPES as IMPORTED_TARGET_CUBE_TYPES } from './TargetCubeColors.js';

/**
 * Dimensions de la grille de jeu
 */
export const GRID_CONFIG = {
    columns: 20,
    rows: 20,
    cellSize: 40,
    groundY: 0,
};

/**
 * Positions relatives dans la grille (fraction de rows/columns)
 */
export const CUBE_POSITIONS = {
    leftEdge: 0,
    rightEdge: GRID_CONFIG.columns - 1,
    centerColumn: Math.floor(GRID_CONFIG.columns / 2),
    centerRow: Math.floor(GRID_CONFIG.rows / 2),
    enemyTopRow: 3,
    enemyBottomRow: GRID_CONFIG.rows - 4,
};

/**
 * Tailles relatives des objets (en pourcentage de cellSize)
 */
export const SIZE_FACTORS = {
    projectile: 0.35,      // Projectile = 35% cellSize
    targetCube: 0.3,       // Cube cible = 30% cellSize
    obstacleScale: 2,      // Obstacle = 2x cellSize
};

/**
 * Configurations des projectiles et missiles
 */
export const MISSILE_CONFIGS = {
    default: {
        durationMs: 1200,
        arcHeight: GRID_CONFIG.cellSize * 5,
        color: '#ffd34d',
        gravity: 1,
        particleCount: 14,
        particleColors: ['#ffcc66', '#ffd34d', '#ff9966', '#ff6b6b', '#ffe3a3'],
        spinSpeed: {
            x: 360,
            y: 420,
            z: 280,
        },
        randomRotation: true,
    },
};

/**
 * Paramètres de physique des particules
 */
export const PARTICLE_PHYSICS = {
    gravityBase: 2200,      // Force de gravité de base (multiplié par missile.gravity)
    bounceDamping: 0.35,    // Amortissement au rebond (35% énergie restante)
    friction: 0.7,          // Friction appliquée chaque frame (70% vitesse restante)
    maxDeltaSeconds: 0.05,  // Clamp delta time max pour éviter gros sauts
};

/**
 * Animations et interactions
 */
export const ANIMATION_CONFIG = {
    sourceFireScaleUp: 1.1,     // Grossissement du cube qui tire (10% plus gros)
    fireAnimationDuration: 0.15, // Durée animation (en secondes)
    fireworksCount: 10,          // Nombre de projectiles du feu d'artifice
};

/**
 * Couleurs des cubes
 */
export const COLORS = {
    leftShooter: '#32b9ff',   // Bleu cyan
    rightShooter: '#ff7a32',  // Orange
    enemy: '#2f6cff',         // Bleu foncé
    obstacle: '#ff4444',      // Rouge
};

/**
 * Types de cubes cibles avec leurs styles visuels.
 * Importés depuis TargetCubeColors.js pour configuration centralisée.
 * Chaque type est un objet avec propriétés extensibles (couleur et plus).
 */
export const TARGET_CUBE_TYPES = IMPORTED_TARGET_CUBE_TYPES;
