/**
 * SaveLoadBar.js — Toolbar section for save/load slot management.
 *
 * Inserts itself into #toolbar with:
 * - A vertical separator
 * - A <select> dropdown listing available save slots
 * - Buttons: New, Save, Load, Delete
 *
 * Communicates with the outside world via callback properties:
 *   onSave(slotName), onLoad(slotName), onDelete(slotName), onNewSlot(slotName)
 */

export class SaveLoadBar {
  /**
   * @type {HTMLSelectElement} Slot dropdown
   */
  _select;

  /**
   * @type {Function|null} Called when the user clicks Save
   */
  onSave;

  /**
   * @type {Function|null} Called when the user clicks Load
   */
  onLoad;

  /**
   * @type {Function|null} Called when the user clicks Delete
   */
  onDelete;

  /**
   * @type {Function|null} Called when the user creates a new slot
   */
  onNewSlot;

  constructor() {
    this.onSave = null;
    this.onLoad = null;
    this.onDelete = null;
    this.onNewSlot = null;

    const toolbar = document.getElementById('toolbar');

    // Separator
    const sep = document.createElement('div');
    sep.className = 'saveload-separator';
    toolbar.appendChild(sep);

    // Slot dropdown
    this._select = document.createElement('select');
    this._select.className = 'saveload-select';
    toolbar.appendChild(this._select);

    // Buttons
    this._addButton(toolbar, 'New', () => this._handleNew());
    this._addButton(toolbar, 'Save', () => this._handleSave());
    this._addButton(toolbar, 'Load', () => this._handleLoad());
    this._addButton(toolbar, 'Delete', () => this._handleDelete());
  }

  /**
   * Update the dropdown with a list of slot names and select one.
   *
   * @param {string[]} names   Available slot names
   * @param {string}   active  Slot to mark as selected
   */
  updateSlots(names, active) {
    this._select.innerHTML = '';
    for (const name of names) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === active) {
        opt.selected = true;
      }
      this._select.appendChild(opt);
    }
  }

  /**
   * Show a brief toast message at the bottom of the viewport.
   *
   * @param {string} msg
   */
  showFeedback(msg) {
    const toast = document.createElement('div');
    toast.className = 'saveload-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('saveload-toast--fade');
    }, 1200);

    setTimeout(() => {
      toast.remove();
    }, 1700);
  }

  /**
   * @returns {string} Currently selected slot name
   */
  get selectedSlot() {
    return this._select.value;
  }

  // --- Private helpers ---

  /**
   * Create a toolbar button and append it.
   *
   * @param {HTMLElement} parent
   * @param {string}      label
   * @param {Function}    onClick
   * @private
   */
  _addButton(parent, label, onClick) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    parent.appendChild(btn);
  }

  /** @private */
  _handleNew() {
    const name = prompt('Slot name:');
    if (!name || !name.trim()) {
      return;
    }
    if (this.onNewSlot) {
      this.onNewSlot(name.trim());
    }
  }

  /** @private */
  _handleSave() {
    const slot = this.selectedSlot;
    if (!slot) {
      return;
    }
    if (this.onSave) {
      this.onSave(slot);
    }
  }

  /** @private */
  _handleLoad() {
    const slot = this.selectedSlot;
    if (!slot) {
      return;
    }
    if (this.onLoad) {
      this.onLoad(slot);
    }
  }

  /** @private */
  _handleDelete() {
    const slot = this.selectedSlot;
    if (!slot) {
      return;
    }
    if (this.onDelete) {
      this.onDelete(slot);
    }
  }
}
