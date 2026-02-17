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
    projectileMinPx: 14,   // Plancher en pixels pour la taille d'un projectile
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
 * Paramètres de l'explosion de particules (ExplosionSystem)
 */
export const EXPLOSION_CONFIG = {
    particleMinSizeFactor: 0.12,
    particleMinSizeFloor: 6,
    particleMaxSizeFactor: 0.28,
    particleMaxSizeFloor: 12,
    speedMin: 260,
    speedRange: 340,
    initialUpwardVelocity: 650,
    lifetimeMin: 600,
    lifetimeRange: 300,
    shockwave: {
        sizeFactor: 1.2,
        borderWidth: 2,
        borderColor: 'rgba(255, 210, 140, 0.8)',
        shadowBlur: 12,
        shadowColor: 'rgba(255, 180, 80, 0.6)',
        initialScale: 0.2,
        finalScale: 2.6,
        durationSeconds: 0.45,
    },
};

/**
 * Paramètres de la vibration d'impact (ImpactShakeSystem)
 */
export const SHAKE_CONFIG = {
    durationMs: 220,
    amplitudeFactor: 0.06,
    rotationAmplitude: 6,
    verticalReduction: 0.5,
};

/**
 * Paramètres du missile vertical (DropMissileSystem)
 */
export const DROP_MISSILE_CONFIG = {
    gravity: 1200,
    startHeightMultiplier: 15,
    fixedDeltaTime: 0.016,
};

/**
 * Paramètres de placement des sous-cubes dans une cellule
 */
export const SUB_CUBE_CONFIG = {
    margin: 2,
};

/**
 * Nombre de positions par étage dans la grille 2x2
 */
export const POSITIONS_PER_LEVEL = 4;

/**
 * Types de cubes cibles avec leurs styles visuels.
 * Importés depuis TargetCubeColors.js pour configuration centralisée.
 * Chaque type est un objet avec propriétés extensibles (couleur et plus).
 */
export const TARGET_CUBE_TYPES = IMPORTED_TARGET_CUBE_TYPES;
