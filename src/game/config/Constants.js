/**
 * Constants.js — Configuration centralisée des constantes du jeu.
 * Évite les magic numbers et rend la configuration maintenable.
 *
 * Organisation :
 *  1. Grille & layout (dimensions, positions, empilement)
 *  2. Tailles & couleurs des objets
 *  3. Projectiles & missiles (trajectoires, missiles verticaux)
 *  4. Physique & effets (particules, explosions, vibrations)
 *  5. Animations & interactions
 */

import { TARGET_CUBE_TYPES as IMPORTED_TARGET_CUBE_TYPES } from './TargetCubeColors.js';

// ─────────────────────────────────────────────
//  1. Grille & layout
// ─────────────────────────────────────────────

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
 * Placement des sous-cubes (grille 2x2) à l'intérieur d'une cellule.
 * Utilisé par ShootGame pour dimensionner et espacer les TargetCubes empilés.
 */
export const SUB_CUBE_CONFIG = {
    margin: 2, // Espace en px entre deux sous-cubes adjacents
};

/**
 * Nombre de sous-cubes par étage dans la grille 2x2 (= 2 colonnes x 2 lignes).
 * Au-delà de 4 cubes dans une cellule, on empile un nouvel étage.
 */
export const POSITIONS_PER_LEVEL = 4;

// ─────────────────────────────────────────────
//  2. Tailles & couleurs
// ─────────────────────────────────────────────

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
 */
export const TARGET_CUBE_TYPES = IMPORTED_TARGET_CUBE_TYPES;

// ─────────────────────────────────────────────
//  3. Projectiles & missiles
// ─────────────────────────────────────────────

/**
 * Configurations des projectiles paraboliques (ProjectileSystem)
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
 * Paramètres du missile vertical qui tombe depuis le haut de l'écran (DropMissileSystem)
 */
export const DROP_MISSILE_CONFIG = {
    gravity: 1200,              // Accélération de chute (px/s²) — plus faible que la gravité particule
    startHeightMultiplier: 15,  // Y initial = -(cellSize * 15), très haut au-dessus de la scène
    fixedDeltaTime: 0.016,      // Pas de temps fixe (~60 FPS) pour la simulation de chute
};

// ─────────────────────────────────────────────
//  4. Physique & effets
// ─────────────────────────────────────────────

/**
 * Physique des particules d'explosion (rebond, friction, gravité)
 */
export const PARTICLE_PHYSICS = {
    gravityBase: 2200,      // Force de gravité de base (multiplié par missile.gravity)
    bounceDamping: 0.35,    // Amortissement au rebond (35% énergie restante)
    friction: 0.7,          // Friction appliquée chaque frame (70% vitesse restante)
    maxDeltaSeconds: 0.05,  // Clamp delta time max pour éviter gros sauts
};

/**
 * Paramètres visuels de l'explosion de particules (ExplosionSystem).
 * Contrôle la taille, vitesse, durée de vie des particules et l'onde de choc.
 */
export const EXPLOSION_CONFIG = {
    // Taille des particules = cellSize * factor, avec un plancher en px
    particleMinSizeFactor: 0.12,
    particleMinSizeFloor: 6,    // px
    particleMaxSizeFactor: 0.28,
    particleMaxSizeFloor: 12,   // px

    // Vitesse d'éjection des particules (px/s)
    speedMin: 260,
    speedRange: 340,            // vitesse = speedMin + random * speedRange

    // Impulsion verticale vers le haut au moment du spawn
    initialUpwardVelocity: 650, // px/s

    // Durée de vie des particules (ms)
    lifetimeMin: 600,
    lifetimeRange: 300,         // lifetime = lifetimeMin + random * lifetimeRange

    // Onde de choc circulaire qui se dilate puis disparaît
    shockwave: {
        sizeFactor: 1.2,        // Diamètre initial = cellSize * sizeFactor
        borderWidth: 2,         // px
        borderColor: 'rgba(255, 210, 140, 0.8)',
        shadowBlur: 12,         // px
        shadowColor: 'rgba(255, 180, 80, 0.6)',
        initialScale: 0.2,      // scale3d au spawn
        finalScale: 2.6,        // scale3d en fin d'animation
        durationSeconds: 0.45,  // durée de la transition CSS
    },
};

/**
 * Vibration visuelle appliquée à un cube lors d'un impact (ImpactShakeSystem).
 * Le shake diminue linéairement sur durationMs (damping = 1 → 0).
 */
export const SHAKE_CONFIG = {
    durationMs: 220,            // Durée totale de la vibration
    amplitudeFactor: 0.06,      // Amplitude = cellSize * 0.06
    rotationAmplitude: 6,       // Rotation max en degrés (X, Y, Z)
    verticalReduction: 0.5,     // L'axe Y vibre 50% moins que X/Z
};

// ─────────────────────────────────────────────
//  5. Animations & interactions
// ─────────────────────────────────────────────

/**
 * Animations et interactions
 */
export const ANIMATION_CONFIG = {
    sourceFireScaleUp: 1.1,     // Grossissement du cube qui tire (10% plus gros)
    fireAnimationDuration: 0.15, // Durée animation (en secondes)
    fireworksCount: 10,          // Nombre de projectiles du feu d'artifice
};
