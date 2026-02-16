/**
 * MaterialPalette.js — Floating palette panel for material selection.
 *
 * Builds a fixed-position panel on document.body with:
 * - A draggable header to reposition the palette
 * - A grid of colored swatches (one per material)
 *
 * Clicking a swatch selects it as the active material.
 * Swatches can also be dragged onto cubes (handled by SwatchDragHandler).
 */

export class MaterialPalette {
  /**
   * @type {HTMLElement} Root element of the palette panel
   */
  _el;

  /**
   * @type {HTMLElement} Draggable header bar
   */
  _header;

  /**
   * @type {HTMLElement} Container for swatch elements
   */
  _swatchContainer;

  /**
   * @type {string|null} Currently selected material id
   */
  _activeMaterial;

  /**
   * @type {Function|null} Callback invoked when a material is selected
   */
  onSelect;

  /**
   * @param {Array<{id: string, label: string, color: string}>} materials
   */
  constructor(materials) {
    this._activeMaterial = null;
    this.onSelect = null;

    this._el = document.createElement('div');
    this._el.className = 'mat-palette';

    this._header = document.createElement('div');
    this._header.className = 'mat-palette__header';
    this._header.textContent = 'Materials';
    this._el.appendChild(this._header);

    this._swatchContainer = document.createElement('div');
    this._swatchContainer.className = 'mat-palette__grid';
    this._el.appendChild(this._swatchContainer);

    this._buildSwatches(materials);
    this._initDragHandle();

    document.body.appendChild(this._el);
  }

  /** @returns {HTMLElement} The root palette element. */
  get el() {
    return this._el;
  }

  /** @returns {HTMLElement} The swatch container element. */
  get swatchContainer() {
    return this._swatchContainer;
  }

  /**
   * Select a material by id (updates active border).
   *
   * @param {string} materialId
   */
  select(materialId) {
    this._activeMaterial = materialId;
    for (const swatch of this._swatchContainer.children) {
      swatch.classList.toggle('active', swatch.dataset.material === materialId);
    }
  }

  /**
   * Build one swatch element per material.
   *
   * @param {Array<{id: string, label: string, color: string}>} materials
   * @private
   */
  _buildSwatches(materials) {
    for (const mat of materials) {
      const swatch = document.createElement('div');
      swatch.className = 'mat-palette__swatch';
      swatch.dataset.material = mat.id;
      swatch.style.background = mat.color;
      swatch.title = mat.label;

      swatch.addEventListener('click', () => {
        this.select(mat.id);
        if (this.onSelect) {
          this.onSelect(mat.id);
        }
      });

      this._swatchContainer.appendChild(swatch);
    }
  }

  /**
   * Make the header a drag handle to reposition the palette.
   * Uses mousedown/mousemove/mouseup on window to move the panel.
   *
   * @private
   */
  _initDragHandle() {
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const onMouseMove = (e) => {
      if (!dragging) {
        return;
      }
      this._el.style.left = `${e.clientX - offsetX}px`;
      this._el.style.top = `${e.clientY - offsetY}px`;
      // Clear bottom/right so position is driven by left/top
      this._el.style.bottom = 'auto';
      this._el.style.right = 'auto';
    };

    const onMouseUp = () => {
      dragging = false;
    };

    this._header.addEventListener('mousedown', (e) => {
      dragging = true;
      const rect = this._el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.preventDefault();
    });

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
}
