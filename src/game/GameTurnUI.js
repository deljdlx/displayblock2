/**
 * GameTurnUI.js — Panel UI affichant le numéro du tour courant et un bouton "Next".
 * Position fixe (bas-gauche) avec style cohérent avec TargetCubeStats.
 */

export class GameTurnUI {
    /**
     * @type {HTMLElement}
     */
    _panel;

    /**
     * @type {HTMLElement}
     */
    _turnNumberDisplay;

    /**
     * @type {HTMLButtonElement}
     */
    _nextButton;

    /**
     * @type {Function}
     */
    _onNextButtonClick;

    /**
     * @param {Function} onNextButtonClick - Callback quand le bouton "Next" est cliqué
     */
    constructor(onNextButtonClick) {
        this._onNextButtonClick = onNextButtonClick;
        this._createUI();
    }

    /**
     * Crée et injecte les éléments DOM du panel.
     * @returns {void}
     * @private
     */
    _createUI() {
        // Panel principal
        this._panel = document.createElement('div');
        this._panel.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background-color: rgba(20, 20, 20, 0.85);
            border: 2px solid rgba(100, 200, 255, 0.6);
            border-radius: 8px;
            padding: 12px 16px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #fff;
            z-index: 999;
            min-width: 150px;
        `;

        // Affichage du numéro de tour
        this._turnNumberDisplay = document.createElement('div');
        this._turnNumberDisplay.style.cssText = `
            margin-bottom: 8px;
            color: #64c8ff;
            font-weight: bold;
            text-align: center;
        `;
        this._turnNumberDisplay.textContent = 'Turn: 1';

        // Bouton "Next"
        this._nextButton = document.createElement('button');
        this._nextButton.textContent = 'Next Turn';
        this._nextButton.style.cssText = `
            width: 100%;
            padding: 6px 12px;
            background-color: #32b9ff;
            border: 1px solid #64c8ff;
            border-radius: 4px;
            color: #000;
            font-weight: bold;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            transition: all 0.2s ease;
        `;

        // Hover effect
        this._nextButton.addEventListener('mouseenter', () => {
            this._nextButton.style.backgroundColor = '#64c8ff';
            this._nextButton.style.transform = 'scale(1.05)';
        });
        this._nextButton.addEventListener('mouseleave', () => {
            this._nextButton.style.backgroundColor = '#32b9ff';
            this._nextButton.style.transform = 'scale(1)';
        });

        // Click handler
        this._nextButton.addEventListener('click', () => {
            this._onNextButtonClick();
        });

        this._panel.appendChild(this._turnNumberDisplay);
        this._panel.appendChild(this._nextButton);
        document.body.appendChild(this._panel);
    }

    /**
     * Met à jour l'affichage du numéro de tour.
     * @param {number} turnNumber - Le nouveau numéro de tour
     * @returns {void}
     */
    updateTurnDisplay(turnNumber) {
        this._turnNumberDisplay.textContent = `Turn: ${turnNumber}`;
    }

    /**
     * Désactive le panel UI (le rend invisible et non-interactif).
     * @returns {void}
     */
    disable() {
        this._panel.style.pointerEvents = 'none';
        this._panel.style.opacity = '0.5';
    }

    /**
     * Réactive le panel UI.
     * @returns {void}
     */
    enable() {
        this._panel.style.pointerEvents = 'auto';
        this._panel.style.opacity = '1';
    }
}
