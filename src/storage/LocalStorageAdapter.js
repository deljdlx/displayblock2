/**
 * LocalStorageAdapter.js — Persistence backend using browser localStorage.
 *
 * Each save slot is stored as a JSON string under the key `2td-save-{slotName}`.
 * A separate index key `2td-saves-index` keeps a JSON array of all slot names.
 *
 * All methods are async (returning resolved promises) so the interface
 * stays compatible with a future API-based adapter.
 */

import { StorageAdapter } from './StorageAdapter.js';

export class LocalStorageAdapter extends StorageAdapter {
  /**
   * @type {string} Prefix for individual save keys
   */
  _prefix = '2td-save-';

  /**
   * @type {string} Key storing the JSON array of slot names
   */
  _indexKey = '2td-saves-index';

  /**
   * List all saved slot names.
   *
   * @returns {Promise<string[]>}
   */
  async listSlots() {
    try {
      const raw = localStorage.getItem(this._indexKey);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_e) {
      return [];
    }
  }

  /**
   * Load the data stored under `slotName`.
   *
   * @param {string} slotName
   * @returns {Promise<object|null>}
   */
  async load(slotName) {
    try {
      const raw = localStorage.getItem(this._prefix + slotName);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (_e) {
      return null;
    }
  }

  /**
   * Save `data` under `slotName` and update the slot index.
   *
   * @param {string} slotName
   * @param {object} data
   * @returns {Promise<void>}
   */
  async save(slotName, data) {
    localStorage.setItem(this._prefix + slotName, JSON.stringify(data));
    await this._addToIndex(slotName);
  }

  /**
   * Delete the slot and remove it from the index.
   *
   * @param {string} slotName
   * @returns {Promise<void>}
   */
  async delete(slotName) {
    localStorage.removeItem(this._prefix + slotName);
    await this._removeFromIndex(slotName);
  }

  /**
   * Add a slot name to the index (if not already present).
   *
   * @param {string} slotName
   * @returns {Promise<void>}
   * @private
   */
  async _addToIndex(slotName) {
    const slots = await this.listSlots();
    if (!slots.includes(slotName)) {
      slots.push(slotName);
      localStorage.setItem(this._indexKey, JSON.stringify(slots));
    }
  }

  /**
   * Remove a slot name from the index.
   *
   * @param {string} slotName
   * @returns {Promise<void>}
   * @private
   */
  async _removeFromIndex(slotName) {
    const slots = await this.listSlots();
    const filtered = slots.filter((s) => s !== slotName);
    localStorage.setItem(this._indexKey, JSON.stringify(filtered));
  }
}
