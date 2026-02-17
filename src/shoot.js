/**
 * shoot.js — entry point pour la page Shoot.
 * Charge les styles et lance le mini-jeu.
 */

import './styles/main.css';
import './styles/toolbar.css';
import './styles/engine.css';
import { ShootGame } from './game/ShootGame.js';

/**
 * @returns {void}
 */
function initShootScene() {
    const app = document.getElementById('app');

    if (!app) {
        return;
    }

    const game = new ShootGame(app);
    game.init();
}

window.addEventListener('DOMContentLoaded', initShootScene);
