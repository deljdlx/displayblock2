/**
 * GridLayouts.js — Configurations prédéfinies pour différentes dispositions de grille.
 * Permet de basculer entre différents modes ou scénarios de jeu.
 */

import { GRID_CONFIG } from './Constants.js';
import { COLORS } from './Constants.js';

/**
 * Layout complet avec tous les cubes (shooters, ennemis, obstacle).
 */
export const GRID_LAYOUT_FULL = {
    leftShooter: {
        key: 'leftShooter',
        color: COLORS.leftShooter,
        column: GRID_CONFIG.columns - 1,
        row: Math.floor(GRID_CONFIG.rows / 2),
        sizeScale: 1,
        interactive: true,
        description: 'Cube tireur de gauche',
    },
    rightShooter: {
        key: 'rightShooter',
        color: COLORS.rightShooter,
        column: 0,
        row: Math.floor(GRID_CONFIG.rows / 2),
        sizeScale: 1,
        interactive: true,
        description: 'Cube tireur de droite',
    },
    enemyTop: {
        key: 'enemyTop',
        color: COLORS.enemy,
        column: Math.floor(GRID_CONFIG.columns / 2),
        row: 3,
        sizeScale: 1,
        interactive: false,
        description: 'Ennemi au sommet',
    },
    enemyBottom: {
        key: 'enemyBottom',
        color: COLORS.enemy,
        column: Math.floor(GRID_CONFIG.columns / 2),
        row: GRID_CONFIG.rows - 4,
        sizeScale: 1,
        interactive: false,
        description: 'Ennemi à la base',
    },
    obstacle: {
        key: 'obstacle',
        color: COLORS.obstacle,
        column: Math.floor(GRID_CONFIG.columns / 2),
        row: Math.floor(GRID_CONFIG.rows / 2),
        sizeScale: 1,
        interactive: true,
        description: 'Obstacle central (feu d\'artifice)',
    },
};

/**
 * Layout minimaliste avec seulement le cube obstacle.
 * Utilisé pour des tests ou un mode sandbox.
 */
export const GRID_LAYOUT_MINIMAL = {
    obstacle: {
        key: 'obstacle',
        color: COLORS.obstacle,
        column: Math.floor(GRID_CONFIG.columns / 2),
        row: Math.floor(GRID_CONFIG.rows / 2),
        sizeScale: 2,
        interactive: true,
        description: 'Obstacle central (feu d\'artifice)',
    },
};
