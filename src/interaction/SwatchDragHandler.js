/**
 * SwatchDragHandler.js — Drag-to-paint interaction for material swatches.
 *
 * Listens for mousedown on swatch elements inside the palette.
 * If the user drags beyond a small threshold, a ghost preview follows the cursor.
 * On mouseup:
 *   - If the cursor is over a cube face (.db-face) → calls onDropOnCube
 *   - Otherwise → selects the material via onSelect
 *
 * The ghost has `pointer-events: none` so mouseup always hits the element
 * beneath it (a cube face or whatever else is under the cursor).
 */

export class SwatchDragHandler {
  /**
   * @type {Function|null} Called when a swatch is dropped on a cube face.
   *                       Signature: (cubeEl: HTMLElement, materialId: string) => void
   */
  onDropOnCube;

  /**
   * @type {Function|null} Called when a swatch drag ends without hitting a cube.
   *                       Signature: (materialId: string) => void
   */
  onSelect;

  /**
   * @param {HTMLElement} swatchContainer  The element containing all swatches
   */
  constructor(swatchContainer) {
    this.onDropOnCube = null;
    this.onSelect = null;

    this._container = swatchContainer;
    this._dragging = false;
    this._ghost = null;
    this._startX = 0;
    this._startY = 0;
    this._materialId = null;
    this._materialColor = null;

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    this._container.addEventListener('mousedown', this._onMouseDown);
  }

  /** Minimum distance (px) before a click becomes a drag. */
  static DRAG_THRESHOLD = 3;

  /**
   * @param {MouseEvent} e
   * @private
   */
  _onMouseDown(e) {
    const swatch = e.target.closest('.mat-palette__swatch');
    if (!swatch) {
      return;
    }

    this._startX = e.clientX;
    this._startY = e.clientY;
    this._materialId = swatch.dataset.material;
    this._materialColor = swatch.style.background;
    this._dragging = false;

    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);

    e.preventDefault();
  }

  /**
   * @param {MouseEvent} e
   * @private
   */
  _onMouseMove(e) {
    const dx = e.clientX - this._startX;
    const dy = e.clientY - this._startY;

    if (!this._dragging && Math.hypot(dx, dy) > SwatchDragHandler.DRAG_THRESHOLD) {
      this._dragging = true;
      this._createGhost();
    }

    if (this._dragging && this._ghost) {
      this._ghost.style.left = `${e.clientX - 12}px`;
      this._ghost.style.top = `${e.clientY - 12}px`;
    }
  }

  /**
   * @param {MouseEvent} e
   * @private
   */
  _onMouseUp(e) {
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);

    this._removeGhost();

    if (this._dragging) {
      // Ghost had pointer-events: none, so e.target is the element under cursor
      const faceEl = e.target.closest('.db-face');
      const cubeEl = faceEl ? faceEl.closest('.db-cuboid') : null;

      if (cubeEl && this.onDropOnCube) {
        this.onDropOnCube(cubeEl, this._materialId);
      } else if (this.onSelect) {
        this.onSelect(this._materialId);
      }
    }
    // If not dragging, the click event on the swatch handles selection

    this._dragging = false;
    this._materialId = null;
    this._materialColor = null;
  }

  /**
   * Create the ghost element that follows the cursor during drag.
   *
   * @private
   */
  _createGhost() {
    this._ghost = document.createElement('div');
    this._ghost.className = 'mat-palette__ghost';
    this._ghost.style.background = this._materialColor;
    document.body.appendChild(this._ghost);
  }

  /**
   * Remove the ghost element from the DOM.
   *
   * @private
   */
  _removeGhost() {
    if (this._ghost) {
      this._ghost.remove();
      this._ghost = null;
    }
  }
}
